import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    key: {
      type: String,
      unique: true,
      trim: true,
    },
    value: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    type: {
      type: String,
      required: [true, "Content type is required"],
      enum: ["article", "announcement", "devotional", "news", "testimony"],
      default: "article",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "fellowship",
        "spiritual",
        "events",
        "ministry",
        "testimonies",
        "general",
      ],
      default: "general",
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    coverImage: {
      type: String,
      default: null,
    },
    readTime: {
      type: Number,
      default: 5, // estimated reading time in minutes
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    publishedAt: {
      type: Date,
      default: null,
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },
    seoKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for like count
contentSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for isPublished
contentSchema.virtual("isPublished").get(function () {
  return this.status === "published";
});

// Indexes for better performance
contentSchema.index({ status: 1, publishedAt: -1 });
contentSchema.index({ type: 1, category: 1 });
contentSchema.index({ author: 1 });

// Pre-save middleware to generate slug and handle publishedAt
contentSchema.pre("save", async function (next) {
  // Always generate slug from title
  if (this.title) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists and make it unique
    let slug = baseSlug;
    let counter = 1;

    while (await Content.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Set publishedAt when status changes to published
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Method to increment views
contentSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to toggle like
contentSchema.methods.toggleLike = function (userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Method to regenerate slug
contentSchema.methods.regenerateSlug = async function () {
  if (this.title) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (await Content.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
    return this.save();
  }
  return this;
};

const Content = mongoose.model("Content", contentSchema);

export default Content;

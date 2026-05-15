import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    trim: true
  },
  originalName: {
    type: String
  },
  mimeType: {
    type: String
  },
  size: {
    type: Number
  },
  path: {
    type: String
  },
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  type: {
    type: String,
    required: [true, 'Media type is required'],
    enum: ['image', 'document', 'video', 'audio'],
    default: 'image'
  },
  category: {
    type: String,
    enum: ['events', 'gallery', 'content', 'profiles', 'documents', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  altText: {
    type: String,
    maxlength: [200, 'Alt text cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  dimensions: {
    width: Number,
    height: Number
  },
  duration: Number, // for video/audio files
  metadata: {
    camera: String,
    location: String,
    dateTaken: Date,
    software: String
  },
  usage: [{
    model: String,
    modelId: mongoose.Schema.Types.ObjectId,
    field: String,
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file size in human readable format
mediaSchema.virtual('sizeFormatted').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.size === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for isImage
mediaSchema.virtual('isImage').get(function() {
  return this.type === 'image';
});

// Virtual for isVideo
mediaSchema.virtual('isVideo').get(function() {
  return this.type === 'video';
});

// Indexes for better performance
mediaSchema.index({ type: 1, category: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ isPublic: 1 });

// Method to add usage tracking
mediaSchema.methods.addUsage = function(model, modelId, field) {
  this.usage.push({
    model,
    modelId,
    field
  });
  return this.save();
};

// Method to remove usage tracking
mediaSchema.methods.removeUsage = function(model, modelId, field) {
  this.usage = this.usage.filter(usage => 
    !(usage.model === model && 
      usage.modelId.toString() === modelId.toString() && 
      usage.field === field)
  );
  return this.save();
};

const Media = mongoose.model('Media', mediaSchema);

export default Media;
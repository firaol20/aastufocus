import { AppError, asyncHandler } from '../middleware/errorsHandler.js';
import Content from '../models/Content.js';

// Create new content
export const createContent = asyncHandler(async (req, res) => {
  const { key, value, type, title, content: contentText, category, status, featured, tags, excerpt } = req.body;

  const content = await Content.create({
    key,
    value,
    type: type || 'article',
    title: title || key,
    content: contentText || value,
    category: category || 'general',
    status: status || 'published',
    featured: featured === 'true' || featured === true,
    tags: Array.isArray(tags) ? tags : [],
    excerpt,
    author: req.user?._id
  });

  res.status(201).json({ success: true, message: 'Content created successfully', data: content });
});

// Get all content
export const getAllContent = asyncHandler(async (req, res) => {
  const { type, search, page = 1, limit = 10, category, status = 'published' } = req.query;

  const query = {};
  if (type) query.type = type;
  if (category) query.category = category;
  if (status) query.status = status;
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { key: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [content, total] = await Promise.all([
    Content.find(query)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Content.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: content,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

// Get content by ID
export const getContentById = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id).populate('author', 'name email avatar');
  if (!content) throw new AppError('Content not found', 404);
  
  // Increment views
  await content.incrementViews();
  
  res.json({ success: true, data: content });
});

// Get content by key (slug equivalent)
export const getContentBySlug = asyncHandler(async (req, res) => {
  const content = await Content.findOne({ 
    $or: [
      { slug: req.params.slug },
      { key: req.params.slug }
    ]
  }).populate('author', 'name email avatar');
  
  if (!content) throw new AppError('Content not found', 404);
  
  // Increment views
  await content.incrementViews();
  
  res.json({ success: true, data: content });
});

// Update content
export const updateContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);
  if (!content) throw new AppError('Content not found', 404);

  if (!['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update content', 403);
  }

  const { key, value, type, title, content: contentText, category, status, featured, tags, excerpt } = req.body;
  
  if (key !== undefined) content.key = key;
  if (value !== undefined) content.value = value;
  if (type !== undefined) content.type = type;
  if (title !== undefined) content.title = title;
  if (contentText !== undefined) content.content = contentText;
  if (category !== undefined) content.category = category;
  if (status !== undefined) content.status = status;
  if (featured !== undefined) content.featured = featured === 'true' || featured === true;
  if (tags !== undefined) content.tags = Array.isArray(tags) ? tags : [];
  if (excerpt !== undefined) content.excerpt = excerpt;

  await content.save();
  await content.populate('author', 'name email avatar');

  res.json({ success: true, message: 'Content updated successfully', data: content });
});

// Delete content
export const deleteContent = asyncHandler(async (req, res) => {
  const content = await Content.findByIdAndDelete(req.params.id);
  if (!content) throw new AppError('Content not found', 404);

  if (!['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to delete content', 403);
  }

  res.json({ success: true, message: 'Content deleted successfully' });
});

// Toggle Like
export const toggleContentLike = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);
  if (!content) throw new AppError('Content not found', 404);

  await content.toggleLike(req.user.id);
  res.json({ success: true, message: 'Like toggled successfully', data: { likeCount: content.likeCount } });
});

// Get User's Content
export const getUserContent = asyncHandler(async (req, res) => {
  const content = await Content.find({ author: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: content });
});

// Get Featured Content
export const getFeaturedContent = asyncHandler(async (req, res) => {
  const content = await Content.find({ featured: true, status: 'published' })
    .populate('author', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(5);
  res.json({ success: true, data: content });
});

// Get Content Stats
export const getContentStats = asyncHandler(async (req, res) => {
  const [total, published, drafts, views] = await Promise.all([
    Content.countDocuments(),
    Content.countDocuments({ status: 'published' }),
    Content.countDocuments({ status: 'draft' }),
    Content.aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }])
  ]);

  res.json({ 
    success: true, 
    data: { 
      totalContent: total, 
      published, 
      drafts, 
      totalViews: views[0]?.totalViews || 0 
    } 
  });
});
import { AppError, asyncHandler } from '../middleware/errorsHandler.js';
import prisma from '../utils/prisma.js';

// Create new content
export const createContent = asyncHandler(async (req, res) => {
  const { key, value, type } = req.body;

  const content = await prisma.content.create({
    data: { key, value, type }
  });

  res.status(201).json({ success: true, message: 'Content created successfully', data: content });
});

// Get all content
export const getAllContent = asyncHandler(async (req, res) => {
  const { type, search, page = 1, limit = 10 } = req.query;

  const where = {};
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { key: { contains: search, mode: 'insensitive' } },
      { type: { contains: search, mode: 'insensitive' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [content, total] = await Promise.all([
    prisma.content.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
    prisma.content.count({ where })
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
  const content = await prisma.content.findUnique({ where: { id: req.params.id } });
  if (!content) throw new AppError('Content not found', 404);
  res.json({ success: true, data: content });
});

// Get content by key (slug equivalent)
export const getContentBySlug = asyncHandler(async (req, res) => {
  const content = await prisma.content.findUnique({ where: { key: req.params.slug } });
  if (!content) throw new AppError('Content not found', 404);
  res.json({ success: true, data: content });
});

// Update content
export const updateContent = asyncHandler(async (req, res) => {
  const content = await prisma.content.findUnique({ where: { id: req.params.id } });
  if (!content) throw new AppError('Content not found', 404);

  if (!['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update content', 403);
  }

  const { key, value, type } = req.body;
  const updateData = {};
  if (key !== undefined) updateData.key = key;
  if (value !== undefined) updateData.value = value;
  if (type !== undefined) updateData.type = type;

  const updated = await prisma.content.update({ where: { id: req.params.id }, data: updateData });

  res.json({ success: true, message: 'Content updated successfully', data: updated });
});

// Delete content
export const deleteContent = asyncHandler(async (req, res) => {
  const content = await prisma.content.findUnique({ where: { id: req.params.id } });
  if (!content) throw new AppError('Content not found', 404);

  if (!['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to delete content', 403);
  }

  await prisma.content.delete({ where: { id: req.params.id } });

  res.json({ success: true, message: 'Content deleted successfully' });
});

// Stubs for Mongoose-specific features removed during migration
export const toggleContentLike = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Likes feature not available in this version.' });
});
export const getUserContent = asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
});
export const getFeaturedContent = asyncHandler(async (req, res) => {
  const content = await prisma.content.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: content });
});
export const getContentStats = asyncHandler(async (req, res) => {
  const total = await prisma.content.count();
  res.json({ success: true, data: { totalContent: total } });
});
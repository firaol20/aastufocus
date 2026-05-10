import { AppError, asyncHandler } from '../middleware/errorsHandler.js';
import prisma from '../utils/prisma.js';
import path from 'path';
import fs from 'fs/promises';

// Upload single media file
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const { tags = [], title } = req.body;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

  let mediaType = 'document';
  if (req.file.mimetype.startsWith('image/')) mediaType = 'image';
  else if (req.file.mimetype.startsWith('video/')) mediaType = 'video';
  else if (req.file.mimetype.startsWith('audio/')) mediaType = 'audio';

  const media = await prisma.media.create({
    data: {
      url: fileUrl,
      type: mediaType,
      title: title || req.file.originalname,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean)
    }
  });

  res.status(201).json({ success: true, message: 'Media uploaded successfully', data: media });
});

// Upload multiple media files
export const uploadMultipleMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new AppError('No files uploaded', 400);

  const { tags = [] } = req.body;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const uploadedMedia = [];

  for (const file of req.files) {
    let mediaType = 'document';
    if (file.mimetype.startsWith('image/')) mediaType = 'image';
    else if (file.mimetype.startsWith('video/')) mediaType = 'video';
    else if (file.mimetype.startsWith('audio/')) mediaType = 'audio';

    const media = await prisma.media.create({
      data: {
        url: `${baseUrl}/uploads/${file.filename}`,
        type: mediaType,
        title: file.originalname,
        tags: Array.isArray(tags) ? tags : []
      }
    });
    uploadedMedia.push(media);
  }

  res.status(201).json({
    success: true,
    message: `${uploadedMedia.length} media files uploaded successfully`,
    data: uploadedMedia
  });
});

// Get all media
export const getAllMedia = asyncHandler(async (req, res) => {
  const { type, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const where = {};
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { url: { contains: search, mode: 'insensitive' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.media.count({ where })
  ]);

  res.json({
    success: true,
    data: media,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

// Get media by ID
export const getMediaById = asyncHandler(async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media) throw new AppError('Media not found', 404);
  res.json({ success: true, data: media });
});

// Update media
export const updateMedia = asyncHandler(async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media) throw new AppError('Media not found', 404);

  if (!['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update this media', 403);
  }

  const { title, tags } = req.body;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

  const updated = await prisma.media.update({ where: { id: req.params.id }, data: updateData });

  res.json({ success: true, message: 'Media updated successfully', data: updated });
});

// Delete media
export const deleteMedia = asyncHandler(async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media) throw new AppError('Media not found', 404);

  if (!['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to delete this media', 403);
  }

  // Try to delete physical file
  try {
    const filename = path.basename(media.url);
    const filePath = path.join(process.cwd(), 'uploads', filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting physical file:', error);
  }

  await prisma.media.delete({ where: { id: req.params.id } });

  res.json({ success: true, message: 'Media deleted successfully' });
});

// Bulk update media
export const bulkUpdateMedia = asyncHandler(async (req, res) => {
  const { mediaIds, updates } = req.body;
  if (!mediaIds?.length) throw new AppError('Media IDs array is required', 400);

  const result = await prisma.media.updateMany({ where: { id: { in: mediaIds } }, data: updates });

  res.json({ success: true, message: `${result.count} media files updated`, data: { modifiedCount: result.count } });
});

// Bulk delete media
export const bulkDeleteMedia = asyncHandler(async (req, res) => {
  const { mediaIds } = req.body;
  if (!mediaIds?.length) throw new AppError('Media IDs array is required', 400);

  const result = await prisma.media.deleteMany({ where: { id: { in: mediaIds } } });

  res.json({ success: true, message: `${result.count} media files deleted`, data: { deletedCount: result.count } });
});

// Get media stats
export const getMediaStats = asyncHandler(async (req, res) => {
  const [total, images, videos, documents] = await Promise.all([
    prisma.media.count(),
    prisma.media.count({ where: { type: 'image' } }),
    prisma.media.count({ where: { type: 'video' } }),
    prisma.media.count({ where: { type: 'document' } })
  ]);

  res.json({ success: true, data: { totalMedia: total, images, videos, documents } });
});
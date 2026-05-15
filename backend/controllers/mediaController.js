import { AppError, asyncHandler } from '../middleware/errorsHandler.js';
import Media from '../models/Media.js';
import path from 'path';
import fs from 'fs/promises';

// Upload single media file
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const { tags = [], title, category = 'other' } = req.body;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

  let mediaType = 'document';
  if (req.file.mimetype.startsWith('image/')) mediaType = 'image';
  else if (req.file.mimetype.startsWith('video/')) mediaType = 'video';
  else if (req.file.mimetype.startsWith('audio/')) mediaType = 'audio';

  const media = await Media.create({
    url: fileUrl,
    type: mediaType,
    title: title || req.file.originalname,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    category: category,
    uploadedBy: req.user?._id,
    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [])
  });

  res.status(201).json({ success: true, message: 'Media uploaded successfully', data: media });
});

// Upload multiple media files
export const uploadMultipleMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new AppError('No files uploaded', 400);

  const { tags = [], category = 'other' } = req.body;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const uploadedMedia = [];

  for (const file of req.files) {
    let mediaType = 'document';
    if (file.mimetype.startsWith('image/')) mediaType = 'image';
    else if (file.mimetype.startsWith('video/')) mediaType = 'video';
    else if (file.mimetype.startsWith('audio/')) mediaType = 'audio';

    const media = await Media.create({
      url: `${baseUrl}/uploads/${file.filename}`,
      type: mediaType,
      title: file.originalname,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      category: category,
      uploadedBy: req.user?._id,
      tags: Array.isArray(tags) ? tags : []
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

  const query = {};
  if (type) query.type = type;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { url: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [media, total] = await Promise.all([
    Media.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Media.countDocuments(query)
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
  const media = await Media.findById(req.params.id);
  if (!media) throw new AppError('Media not found', 404);
  res.json({ success: true, data: media });
});

// Update media
export const updateMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw new AppError('Media not found', 404);

  if (!['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update this media', 403);
  }

  const { title, tags, category } = req.body;
  if (title !== undefined) media.title = title;
  if (category !== undefined) media.category = category;
  if (tags !== undefined) media.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

  const updated = await media.save();

  res.json({ success: true, message: 'Media updated successfully', data: updated });
});

// Delete media
export const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) throw new AppError('Media not found', 404);

  if (!['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to delete this media', 403);
  }

  // Try to delete physical file
  try {
    const filename = media.filename || path.basename(media.url);
    const filePath = path.join(process.cwd(), 'uploads', filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting physical file:', error);
  }

  await Media.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Media deleted successfully' });
});

// Bulk update media
export const bulkUpdateMedia = asyncHandler(async (req, res) => {
  const { mediaIds, updates } = req.body;
  if (!mediaIds?.length) throw new AppError('Media IDs array is required', 400);

  const result = await Media.updateMany({ _id: { $in: mediaIds } }, { $set: updates });

  res.json({ success: true, message: `${result.modifiedCount} media files updated`, data: { modifiedCount: result.modifiedCount } });
});

// Bulk delete media
export const bulkDeleteMedia = asyncHandler(async (req, res) => {
  const { mediaIds } = req.body;
  if (!mediaIds?.length) throw new AppError('Media IDs array is required', 400);

  // Note: This doesn't delete physical files. In a real app, you'd want to loop and delete them or use a job.
  const result = await Media.deleteMany({ _id: { $in: mediaIds } });

  res.json({ success: true, message: `${result.deletedCount} media files deleted`, data: { deletedCount: result.deletedCount } });
});

// Get media stats
export const getMediaStats = asyncHandler(async (req, res) => {
  const [total, images, videos, documents] = await Promise.all([
    Media.countDocuments(),
    Media.countDocuments({ type: 'image' }),
    Media.countDocuments({ type: 'video' }),
    Media.countDocuments({ type: 'document' })
  ]);

  res.json({ success: true, data: { totalMedia: total, images, videos, documents } });
});
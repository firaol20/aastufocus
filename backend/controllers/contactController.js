import { AppError, asyncHandler } from '../middleware/errorsHandler.js';
import prisma from '../utils/prisma.js';
import emailService from '../services/emailService.js';

// Create new contact (public)
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  const contact = await prisma.contact.create({
    data: { name, email, subject, message, status: 'pending' }
  });

  try {
    // Build a plain object for the email service
    const contactForEmail = {
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      phone: null,
      category: 'general',
      priority: 'medium',
      createdAt: contact.createdAt,
      _id: contact.id
    };
    await emailService.sendContactNotification(contactForEmail);
    await emailService.sendAutoResponse(contactForEmail);
  } catch (error) {
    console.error('Email sending failed:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for your message. We will get back to you soon!',
    data: { id: contact.id, reference: `#${contact.id.slice(-8).toUpperCase()}` }
  });
});

// Get all contacts (admin/leader only)
export const getAllContacts = asyncHandler(async (req, res) => {
  const { status, search, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

  const where = {};
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
    prisma.contact.count({ where })
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: contacts,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    }
  });
});

// Get contact by ID
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) throw new AppError('Contact not found', 404);
  res.json({ success: true, data: contact });
});

// Update contact status
export const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) throw new AppError('Contact not found', 404);

  const updated = await prisma.contact.update({
    where: { id: req.params.id },
    data: { status: status || contact.status }
  });

  res.json({ success: true, message: 'Contact updated successfully', data: updated });
});

// Add response to contact
export const addResponse = asyncHandler(async (req, res) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) throw new AppError('Contact not found', 404);

  const updated = await prisma.contact.update({
    where: { id: req.params.id },
    data: { status: 'replied' }
  });

  res.json({ success: true, message: 'Response added successfully', data: updated });
});

// Mark as resolved
export const markAsResolved = asyncHandler(async (req, res) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) throw new AppError('Contact not found', 404);

  const updated = await prisma.contact.update({
    where: { id: req.params.id },
    data: { status: 'archived' }
  });

  res.json({ success: true, message: 'Contact marked as resolved', data: updated });
});

// Archive contact
export const archiveContact = asyncHandler(async (req, res) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) throw new AppError('Contact not found', 404);

  const isArchived = contact.status === 'archived';
  const updated = await prisma.contact.update({
    where: { id: req.params.id },
    data: { status: isArchived ? 'pending' : 'archived' }
  });

  res.json({
    success: true,
    message: `Contact ${isArchived ? 'unarchived' : 'archived'} successfully`,
    data: updated
  });
});

// Delete contact
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) throw new AppError('Contact not found', 404);

  await prisma.contact.delete({ where: { id: req.params.id } });

  res.json({ success: true, message: 'Contact deleted successfully' });
});

// Bulk update contacts
export const bulkUpdateContacts = asyncHandler(async (req, res) => {
  const { contactIds, updates } = req.body;
  if (!contactIds?.length) throw new AppError('No contact IDs provided', 400);

  const result = await prisma.contact.updateMany({
    where: { id: { in: contactIds } },
    data: updates
  });

  res.json({
    success: true,
    message: `${result.count} contacts updated successfully`,
    data: { modifiedCount: result.count }
  });
});

// Bulk delete contacts
export const bulkDeleteContacts = asyncHandler(async (req, res) => {
  const { contactIds } = req.body;
  if (!contactIds?.length) throw new AppError('No contact IDs provided', 400);

  const result = await prisma.contact.deleteMany({ where: { id: { in: contactIds } } });

  res.json({
    success: true,
    message: `${result.count} contacts deleted successfully`,
    data: { deletedCount: result.count }
  });
});

// Get contact statistics
export const getContactStats = asyncHandler(async (req, res) => {
  const [total, pending, replied, archived] = await Promise.all([
    prisma.contact.count(),
    prisma.contact.count({ where: { status: 'pending' } }),
    prisma.contact.count({ where: { status: 'replied' } }),
    prisma.contact.count({ where: { status: 'archived' } })
  ]);

  res.json({
    success: true,
    data: { overview: { total, pending, replied, archived } }
  });
});

// Stubs for removed MongoDB-specific features
export const scheduleFollowUp = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Follow-up feature not implemented in this version.' });
});
export const getFollowUpTasks = asyncHandler(async (req, res) => {
  res.json({ success: true, data: [] });
});
export const markFollowUpCompleted = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Follow-up feature not implemented in this version.' });
});
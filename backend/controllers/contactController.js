import { AppError, asyncHandler } from '../middleware/errorsHandler.js';
import Contact from '../models/Contact.js';
import emailService from '../services/emailService.js';

// Map Prisma status to Mongoose status
const statusMap = {
  'pending': 'new',
  'replied': 'responded',
  'archived': 'resolved',
  'resolved': 'resolved'
};

const reverseStatusMap = {
  'new': 'pending',
  'responded': 'replied',
  'resolved': 'resolved',
  'in_progress': 'pending',
  'closed': 'archived'
};

// Create new contact (public)
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message, phone, category = 'general' } = req.body;

  const contact = await Contact.create({ 
    name, 
    email, 
    subject, 
    message, 
    phone,
    category,
    status: 'new' 
  });

  try {
    await emailService.sendContactNotification(contact);
    await emailService.sendAutoResponse(contact);
  } catch (error) {
    console.error('Email sending failed:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for your message. We will get back to you soon!',
    data: { id: contact._id, reference: `#${contact._id.toString().slice(-8).toUpperCase()}` }
  });
});

// Get all contacts (admin/leader only)
export const getAllContacts = asyncHandler(async (req, res) => {
  const { status, search, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) {
    query.status = statusMap[status] || status;
  }
  
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [contacts, total] = await Promise.all([
    Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Contact.countDocuments(query)
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
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new AppError('Contact not found', 404);
  
  if (!contact.isRead) {
    contact.isRead = true;
    await contact.save();
  }
  
  res.json({ success: true, data: contact });
});

// Update contact status
export const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new AppError('Contact not found', 404);

  const mappedStatus = statusMap[status] || status;
  contact.status = mappedStatus;
  await contact.save();

  res.json({ success: true, message: 'Contact updated successfully', data: contact });
});

// Add response to contact
export const addResponse = asyncHandler(async (req, res) => {
  const { responseMessage } = req.body;
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new AppError('Contact not found', 404);

  await contact.addResponse(responseMessage || 'We have received your message and are looking into it.', req.user.id);

  res.json({ success: true, message: 'Response added successfully', data: contact });
});

// Mark as resolved
export const markAsResolved = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new AppError('Contact not found', 404);

  contact.status = 'resolved';
  await contact.save();

  res.json({ success: true, message: 'Contact marked as resolved', data: contact });
});

// Archive contact
export const archiveContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new AppError('Contact not found', 404);

  contact.isArchived = !contact.isArchived;
  if (contact.isArchived && contact.status !== 'closed') {
    contact.status = 'closed';
  }
  await contact.save();

  res.json({
    success: true,
    message: `Contact ${contact.isArchived ? 'archived' : 'unarchived'} successfully`,
    data: contact
  });
});

// Delete contact
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) throw new AppError('Contact not found', 404);

  res.json({ success: true, message: 'Contact deleted successfully' });
});

// Bulk update contacts
export const bulkUpdateContacts = asyncHandler(async (req, res) => {
  const { contactIds, updates } = req.body;
  if (!contactIds?.length) throw new AppError('No contact IDs provided', 400);

  const mappedUpdates = { ...updates };
  if (updates.status) {
    mappedUpdates.status = statusMap[updates.status] || updates.status;
  }

  const result = await Contact.updateMany(
    { _id: { $in: contactIds } },
    { $set: mappedUpdates }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} contacts updated successfully`,
    data: { modifiedCount: result.modifiedCount }
  });
});

// Bulk delete contacts
export const bulkDeleteContacts = asyncHandler(async (req, res) => {
  const { contactIds } = req.body;
  if (!contactIds?.length) throw new AppError('No contact IDs provided', 400);

  const result = await Contact.deleteMany({ _id: { $in: contactIds } });

  res.json({
    success: true,
    message: `${result.deletedCount} contacts deleted successfully`,
    data: { deletedCount: result.deletedCount }
  });
});

// Get contact statistics
export const getContactStats = asyncHandler(async (req, res) => {
  const [total, pending, replied, archived] = await Promise.all([
    Contact.countDocuments(),
    Contact.countDocuments({ status: 'new' }),
    Contact.countDocuments({ status: 'responded' }),
    Contact.countDocuments({ $or: [{ status: 'resolved' }, { status: 'closed' }, { isArchived: true }] })
  ]);

  res.json({
    success: true,
    data: { overview: { total, pending, replied, archived } }
  });
});

// Follow-up features
export const scheduleFollowUp = asyncHandler(async (req, res) => {
  const { scheduledFor, notes } = req.body;
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new AppError('Contact not found', 404);

  await contact.scheduleFollowUp(new Date(scheduledFor), notes);
  res.json({ success: true, message: 'Follow-up scheduled successfully', data: contact });
});

export const getFollowUpTasks = asyncHandler(async (req, res) => {
  const tasks = await Contact.find({ 
    'followUp.required': true, 
    'followUp.completed': false 
  }).sort({ 'followUp.scheduledFor': 1 });
  
  res.json({ success: true, data: tasks });
});

export const markFollowUpCompleted = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) throw new AppError('Contact not found', 404);

  contact.followUp.completed = true;
  await contact.save();
  
  res.json({ success: true, message: 'Follow-up marked as completed', data: contact });
});
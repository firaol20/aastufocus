import { asyncHandler } from '../middleware/errorsHandler.js';
import { AppError } from '../middleware/errorsHandler.js';
import Event from '../models/Event.js';

// Create new event
export const createEvent = asyncHandler(async (req, res) => {
  if(!req.body) {
    throw new AppError('Request body is missing', 400);
  }

  const { title, description, date, startTime, endTime, location, category, maxAttendees, isPublic, tags } = req.body;

  if (!startTime || !endTime) {
    throw new AppError('Start time and end time are required', 400);
  }

  if (startTime >= endTime) {
    throw new AppError('End time must be after start time', 400);
  }

  const eventData = {
    title,
    description,
    date: new Date(date),
    startTime,
    endTime,
    location,
    category,
    maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
    isPublic: isPublic === 'true' || isPublic === true,
    tags: Array.isArray(tags) ? tags : [],
    createdBy: req.user?._id || req.user?.id
  };

  if(req.file) {
    eventData.image = `/uploads/${req.file.filename}`;
  }

  const event = await Event.create(eventData);
  await event.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: event
  });
});

// Get all events (with filters)
export const getAllEvents = asyncHandler(async (req, res) => {
  const {
    category,
    upcoming,
    search,
    page = 1,
    limit = 10,
    sortBy = 'date',
    sortOrder = 'asc'
  } = req.query;

  const query = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (upcoming === 'true') {
    query.date = { $gte: new Date() };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Event.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: events,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Get single event
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('attendees.user', 'name email avatar');

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (!event.isActive) {
    throw new AppError('Event is not active', 400);
  }

  res.json({
    success: true,
    data: event
  });
});

// Update event
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Check if user can update this event
  const creatorId = event.createdBy?._id || event.createdBy;
  if (creatorId.toString() !== req.user.id.toString() && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update this event', 403);
  }

  // Check if end time is after start time
  if (req.body.startTime && req.body.endTime && req.body.startTime >= req.body.endTime) {
    throw new AppError('End time must be after start time', 400);
  }

  const { title, description, date, startTime, endTime, location, category, maxAttendees, isPublic, tags, isActive } = req.body;

  if (title !== undefined) event.title = title;
  if (description !== undefined) event.description = description;
  if (date !== undefined) event.date = new Date(date);
  if (startTime !== undefined) event.startTime = startTime;
  if (endTime !== undefined) event.endTime = endTime;
  if (location !== undefined) event.location = location;
  if (category !== undefined) event.category = category;
  if (maxAttendees !== undefined) event.maxAttendees = parseInt(maxAttendees);
  if (isPublic !== undefined) event.isPublic = isPublic === 'true' || isPublic === true;
  if (tags !== undefined) event.tags = Array.isArray(tags) ? tags : [];
  if (isActive !== undefined) event.isActive = isActive === 'true' || isActive === true;
  if (req.file) event.image = `/uploads/${req.file.filename}`;

  await event.save();
  await event.populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: event
  });
});

// Delete event
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Check if user can delete this event
  const creatorId = event.createdBy?._id || event.createdBy;
  if (creatorId.toString() !== req.user.id.toString() && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to delete this event', 403);
  }

  await Event.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});

// Register for event
export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  const event = await Event.findById(eventId);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (!event.isActive) {
    throw new AppError('Event is not active', 400);
  }

  // Check if event is full
  const activeAttendeesCount = event.attendees.filter(a => a.status !== 'cancelled').length;

  if (event.maxAttendees && activeAttendeesCount >= event.maxAttendees) {
    throw new AppError('Event is full', 400);
  }

  // Check if user is already registered
  const existingRegistration = event.attendees.find(a => a.user.toString() === userId.toString());

  if (existingRegistration) {
    if (existingRegistration.status === 'cancelled') {
      existingRegistration.status = 'registered';
      existingRegistration.registeredAt = new Date();
      await event.save();
      return res.json({
        success: true,
        message: 'Event registration reactivated',
        data: existingRegistration
      });
    } else {
      throw new AppError('Already registered for this event', 400);
    }
  }

  event.attendees.push({ user: userId, status: 'registered' });
  await event.save();

  res.json({
    success: true,
    message: 'Successfully registered for event',
    data: event.attendees[event.attendees.length - 1]
  });
});

// Cancel event registration
export const cancelEventRegistration = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  const event = await Event.findById(eventId);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const registration = event.attendees.find(a => a.user.toString() === userId.toString());

  if (!registration) {
    throw new AppError('Not registered for this event', 400);
  }

  if (registration.status === 'cancelled') {
    throw new AppError('Registration is already cancelled', 400);
  }

  registration.status = 'cancelled';
  await event.save();

  res.json({
    success: true,
    message: 'Event registration cancelled',
    data: registration
  });
});

// Get user's registered events
export const getUserEvents = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const events = await Event.find({
    'attendees.user': userId,
    'attendees.status': { $ne: 'cancelled' }
  }).populate('createdBy', 'name email');

  const formattedEvents = events.map(event => {
    const registration = event.attendees.find(a => a.user.toString() === userId.toString());
    const eventObj = event.toObject();
    return {
      ...eventObj,
      registrationStatus: registration.status,
      registeredAt: registration.registeredAt
    };
  });

  res.json({
    success: true,
    data: formattedEvents
  });
});

// Mark attendance (for event organizers)
export const markAttendance = asyncHandler(async (req, res) => {
  const { eventId, userId, status } = req.body;

  const event = await Event.findById(eventId);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Check if user can mark attendance
  const creatorId = event.createdBy?._id || event.createdBy;
  if (creatorId.toString() !== req.user.id.toString() && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to mark attendance', 403);
  }

  const registration = event.attendees.find(a => a.user.toString() === userId.toString());

  if (!registration) {
    throw new AppError('User not registered for this event', 400);
  }

  registration.status = status;
  await event.save();

  res.json({
    success: true,
    message: 'Attendance marked successfully',
    data: registration
  });
});
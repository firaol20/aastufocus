import { asyncHandler } from '../middleware/errorsHandler.js';
import { AppError } from '../middleware/errorsHandler.js';
import prisma from '../utils/prisma.js';

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
    userId: req.user.id
  };

  if(req.file) {
    eventData.image = `/uploads/${req.file.filename}`;
  }

  const event = await prisma.event.create({
    data: eventData,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });

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

  // Build Prisma where filter
  const where = { isActive: true };

  if (category) {
    where.category = category;
  }

  if (upcoming === 'true') {
    where.date = { gte: new Date() };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { attendees: true } }
      },
      orderBy: { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.event.count({ where })
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
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      attendees: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } }
        }
      },
      _count: { select: { attendees: true } }
    }
  });

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
  const event = await prisma.event.findUnique({
    where: { id: req.params.id }
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Check if user can update this event
  if (event.userId !== req.user.id && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update this event', 403);
  }

  // Check if end time is after start time
  if (req.body.startTime && req.body.endTime && req.body.startTime >= req.body.endTime) {
    throw new AppError('End time must be after start time', 400);
  }

  const { title, description, date, startTime, endTime, location, category, maxAttendees, isPublic, tags, isActive } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (date !== undefined) updateData.date = new Date(date);
  if (startTime !== undefined) updateData.startTime = startTime;
  if (endTime !== undefined) updateData.endTime = endTime;
  if (location !== undefined) updateData.location = location;
  if (category !== undefined) updateData.category = category;
  if (maxAttendees !== undefined) updateData.maxAttendees = parseInt(maxAttendees);
  if (isPublic !== undefined) updateData.isPublic = isPublic === 'true' || isPublic === true;
  if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
  if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
  if (req.file) updateData.image = `/uploads/${req.file.filename}`;

  const updatedEvent = await prisma.event.update({
    where: { id: req.params.id },
    data: updateData,
    include: {
      createdBy: { select: { id: true, name: true, email: true } }
    }
  });

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: updatedEvent
  });
});

// Delete event
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id }
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Check if user can delete this event
  if (event.userId !== req.user.id && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to delete this event', 403);
  }

  // Delete attendees first (cascade), then event
  await prisma.eventAttendee.deleteMany({ where: { eventId: req.params.id } });
  await prisma.event.delete({ where: { id: req.params.id } });

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});

// Register for event
export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (!event.isActive) {
    throw new AppError('Event is not active', 400);
  }

  // Check if event is full
  const activeAttendeesCount = await prisma.eventAttendee.count({
    where: { eventId, status: { not: 'cancelled' } }
  });

  if (event.maxAttendees && activeAttendeesCount >= event.maxAttendees) {
    throw new AppError('Event is full', 400);
  }

  // Check if user is already registered
  const existingRegistration = await prisma.eventAttendee.findUnique({
    where: { eventId_userId: { eventId, userId } }
  });

  if (existingRegistration) {
    if (existingRegistration.status === 'cancelled') {
      const updatedRegistration = await prisma.eventAttendee.update({
        where: { id: existingRegistration.id },
        data: { status: 'registered', registeredAt: new Date() }
      });
      return res.json({
        success: true,
        message: 'Event registration reactivated',
        data: updatedRegistration
      });
    } else {
      throw new AppError('Already registered for this event', 400);
    }
  }

  const registration = await prisma.eventAttendee.create({
    data: { eventId, userId, status: 'registered' }
  });

  res.json({
    success: true,
    message: 'Successfully registered for event',
    data: registration
  });
});

// Cancel event registration
export const cancelEventRegistration = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  const registration = await prisma.eventAttendee.findUnique({
    where: { eventId_userId: { eventId, userId } }
  });

  if (!registration) {
    throw new AppError('Not registered for this event', 400);
  }

  if (registration.status === 'cancelled') {
    throw new AppError('Registration is already cancelled', 400);
  }

  const updated = await prisma.eventAttendee.update({
    where: { id: registration.id },
    data: { status: 'cancelled' }
  });

  res.json({
    success: true,
    message: 'Event registration cancelled',
    data: updated
  });
});

// Get user's registered events
export const getUserEvents = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const registrations = await prisma.eventAttendee.findMany({
    where: {
      userId,
      status: { not: 'cancelled' }
    },
    include: {
      event: {
        include: {
          createdBy: { select: { id: true, name: true, email: true } }
        }
      }
    },
    orderBy: { event: { date: 'asc' } }
  });

  const events = registrations.map(r => ({
    ...r.event,
    registrationStatus: r.status,
    registeredAt: r.registeredAt
  }));

  res.json({
    success: true,
    data: events
  });
});

// Mark attendance (for event organizers)
export const markAttendance = asyncHandler(async (req, res) => {
  const { eventId, userId, status } = req.body;

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Check if user can mark attendance
  if (event.userId !== req.user.id && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to mark attendance', 403);
  }

  const registration = await prisma.eventAttendee.findUnique({
    where: { eventId_userId: { eventId, userId } }
  });

  if (!registration) {
    throw new AppError('User not registered for this event', 400);
  }

  const updated = await prisma.eventAttendee.update({
    where: { id: registration.id },
    data: { status }
  });

  res.json({
    success: true,
    message: 'Attendance marked successfully',
    data: updated
  });
});
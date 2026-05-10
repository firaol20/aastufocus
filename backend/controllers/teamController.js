import { asyncHandler } from '../middleware/errorsHandler.js';
import { AppError } from '../middleware/errorsHandler.js';
import prisma from '../utils/prisma.js';

// Create new team
export const createTeam = asyncHandler(async (req, res) => {
  const { name, description, category, maxMembers, isPublic, meetingDay, meetingTime, meetingLocation, goals } = req.body;

  // Check if user is already a leader of another team
  const existingTeam = await prisma.team.findFirst({
    where: { leaderId: req.user.id, isActive: true }
  });
  if (existingTeam) {
    throw new AppError('You can only lead one team at a time', 400);
  }

  const team = await prisma.team.create({
    data: {
      name, description, category,
      leaderId: req.user.id,
      maxMembers: maxMembers ? parseInt(maxMembers) : 20,
      isPublic: isPublic === 'true' || isPublic === true,
      meetingDay, meetingTime, meetingLocation,
      goals: Array.isArray(goals) ? goals : []
    },
    include: {
      leader: { select: { id: true, name: true, email: true, avatar: true } }
    }
  });

  res.status(201).json({ success: true, message: 'Team created successfully', data: team });
});

// Get all teams (with filters)
export const getAllTeams = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

  const where = { isActive: true, isPublic: true };
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      include: {
        leader: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { members: true } }
      },
      orderBy: { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.team.count({ where })
  ]);

  res.json({
    success: true,
    data: teams,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
  });
});

// Get single team
export const getTeamById = asyncHandler(async (req, res) => {
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: {
      leader: { select: { id: true, name: true, email: true, avatar: true, department: true } },
      members: {
        where: { isActive: true },
        include: { user: { select: { id: true, name: true, email: true, avatar: true, department: true, yearOfStudy: true } } }
      },
      achievements: true,
      _count: { select: { members: true } }
    }
  });

  if (!team) throw new AppError('Team not found', 404);
  if (!team.isActive) throw new AppError('Team is not active', 400);

  res.json({ success: true, data: team });
});

// Update team
export const updateTeam = asyncHandler(async (req, res) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (!team) throw new AppError('Team not found', 404);

  if (team.leaderId !== req.user.id && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update this team', 403);
  }

  const { name, description, category, maxMembers, isPublic, isActive, meetingDay, meetingTime, meetingLocation, goals } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (maxMembers !== undefined) updateData.maxMembers = parseInt(maxMembers);
  if (isPublic !== undefined) updateData.isPublic = isPublic === 'true' || isPublic === true;
  if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
  if (meetingDay !== undefined) updateData.meetingDay = meetingDay;
  if (meetingTime !== undefined) updateData.meetingTime = meetingTime;
  if (meetingLocation !== undefined) updateData.meetingLocation = meetingLocation;
  if (goals !== undefined) updateData.goals = Array.isArray(goals) ? goals : [];

  const updatedTeam = await prisma.team.update({
    where: { id: req.params.id },
    data: updateData,
    include: { leader: { select: { id: true, name: true, email: true, avatar: true } } }
  });

  res.json({ success: true, message: 'Team updated successfully', data: updatedTeam });
});

// Delete team
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await prisma.team.findUnique({ where: { id: req.params.id } });
  if (!team) throw new AppError('Team not found', 404);

  if (team.leaderId !== req.user.id && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to delete this team', 403);
  }

  await prisma.teamMember.deleteMany({ where: { teamId: req.params.id } });
  await prisma.achievement.deleteMany({ where: { teamId: req.params.id } });
  await prisma.team.delete({ where: { id: req.params.id } });

  res.json({ success: true, message: 'Team deleted successfully' });
});

// Add member to team
export const addMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const teamId = req.params.id;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { _count: { select: { members: { where: { isActive: true } } } } }
  });
  if (!team) throw new AppError('Team not found', 404);

  if (team.leaderId !== req.user.id && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to add members to this team', 403);
  }

  if (team._count.members >= team.maxMembers) {
    throw new AppError('Team is full', 400);
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } }
  });

  if (existingMember) {
    if (existingMember.isActive) {
      throw new AppError('User is already a member of this team', 400);
    }
    const reactivated = await prisma.teamMember.update({
      where: { id: existingMember.id },
      data: { isActive: true, role: role || 'member' }
    });
    return res.json({ success: true, message: 'Member reactivated successfully', data: reactivated });
  }

  const member = await prisma.teamMember.create({
    data: { teamId, userId, role: role || 'member' }
  });

  res.json({ success: true, message: 'Member added successfully', data: member });
});

// Remove member from team
export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const teamId = req.params.id;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new AppError('Team not found', 404);

  if (team.leaderId !== req.user.id && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to remove members from this team', 403);
  }

  if (team.leaderId === userId) throw new AppError('Cannot remove the team leader', 400);

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } }
  });
  if (!member) throw new AppError('User is not a member of this team', 400);

  await prisma.teamMember.update({ where: { id: member.id }, data: { isActive: false } });

  res.json({ success: true, message: 'Member removed successfully' });
});

// Update member role
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const teamId = req.params.id;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new AppError('Team not found', 404);

  if (team.leaderId !== req.user.id && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update member roles', 403);
  }

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } }
  });
  if (!member) throw new AppError('User is not a member of this team', 400);

  const updated = await prisma.teamMember.update({ where: { id: member.id }, data: { role } });

  res.json({ success: true, message: 'Member role updated successfully', data: updated });
});

// Get user's teams
export const getUserTeams = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [ledTeams, memberTeams] = await Promise.all([
    prisma.team.findMany({
      where: { leaderId: userId, isActive: true },
      include: { leader: { select: { id: true, name: true, email: true, avatar: true } }, _count: { select: { members: true } } }
    }),
    prisma.teamMember.findMany({
      where: { userId, isActive: true },
      include: {
        team: {
          include: { leader: { select: { id: true, name: true, email: true, avatar: true } }, _count: { select: { members: true } } }
        }
      }
    })
  ]);

  const teams = [...ledTeams, ...memberTeams.map(m => m.team)];

  res.json({ success: true, data: teams });
});

// Join team (for public teams)
export const joinTeam = asyncHandler(async (req, res) => {
  const teamId = req.params.id;
  const userId = req.user.id;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { _count: { select: { members: { where: { isActive: true } } } } }
  });
  if (!team) throw new AppError('Team not found', 404);
  if (!team.isActive) throw new AppError('Team is not active', 400);
  if (!team.isPublic) throw new AppError('This team is not accepting new members', 400);
  if (team._count.members >= team.maxMembers) throw new AppError('Team is full', 400);

  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } }
  });

  if (existingMember) {
    if (existingMember.isActive) throw new AppError('You are already a member of this team', 400);
    const reactivated = await prisma.teamMember.update({
      where: { id: existingMember.id },
      data: { isActive: true }
    });
    return res.json({ success: true, message: 'Successfully rejoined the team', data: reactivated });
  }

  const member = await prisma.teamMember.create({
    data: { teamId, userId, role: 'member' }
  });

  res.json({ success: true, message: 'Successfully joined the team', data: member });
});

// Leave team
export const leaveTeam = asyncHandler(async (req, res) => {
  const teamId = req.params.id;
  const userId = req.user.id;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new AppError('Team not found', 404);
  if (team.leaderId === userId) throw new AppError('Team leader cannot leave. Transfer leadership or delete the team.', 400);

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } }
  });
  if (!member || !member.isActive) throw new AppError('You are not a member of this team', 400);

  await prisma.teamMember.update({ where: { id: member.id }, data: { isActive: false } });

  res.json({ success: true, message: 'Successfully left the team' });
});
import { asyncHandler } from '../middleware/errorsHandler.js';
import { AppError } from '../middleware/errorsHandler.js';
import Team from '../models/Team.js';

// Create new team
export const createTeam = asyncHandler(async (req, res) => {
  const { name, description, category, maxMembers, isPublic, meetingDay, meetingTime, meetingLocation, goals } = req.body;

  // Check if user is already a leader of another team
  const existingTeam = await Team.findOne({ leader: req.user.id, isActive: true });
  if (existingTeam) {
    throw new AppError('You can only lead one team at a time', 400);
  }

  const team = await Team.create({
    name, 
    description, 
    category,
    leader: req.user.id,
    maxMembers: maxMembers ? parseInt(maxMembers) : 20,
    isPublic: isPublic === 'true' || isPublic === true,
    meetingSchedule: {
      day: meetingDay?.toLowerCase(),
      time: meetingTime,
      location: meetingLocation
    },
    goals: Array.isArray(goals) ? goals : []
  });

  await team.populate('leader', 'name email avatar');

  res.status(201).json({ success: true, message: 'Team created successfully', data: team });
});

// Get all teams (with filters)
export const getAllTeams = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

  const query = { isActive: true, isPublic: true };
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [teams, total] = await Promise.all([
    Team.find(query)
      .populate('leader', 'name email avatar')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Team.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: teams,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
  });
});

// Get single team
export const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('leader', 'name email avatar department')
    .populate('members.user', 'name email avatar department yearOfStudy');

  if (!team) throw new AppError('Team not found', 404);
  if (!team.isActive) throw new AppError('Team is not active', 400);

  res.json({ success: true, data: team });
});

// Update team
export const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) throw new AppError('Team not found', 404);

  const leaderId = team.leader?._id || team.leader;
  if (leaderId.toString() !== req.user.id.toString() && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update this team', 403);
  }

  const { name, description, category, maxMembers, isPublic, isActive, meetingDay, meetingTime, meetingLocation, goals } = req.body;
  
  if (name !== undefined) team.name = name;
  if (description !== undefined) team.description = description;
  if (category !== undefined) team.category = category;
  if (maxMembers !== undefined) team.maxMembers = parseInt(maxMembers);
  if (isPublic !== undefined) team.isPublic = isPublic === 'true' || isPublic === true;
  if (isActive !== undefined) team.isActive = isActive === 'true' || isActive === true;
  
  if (meetingDay !== undefined || meetingTime !== undefined || meetingLocation !== undefined) {
    team.meetingSchedule = {
      ...team.meetingSchedule,
      day: meetingDay !== undefined ? meetingDay.toLowerCase() : team.meetingSchedule?.day,
      time: meetingTime !== undefined ? meetingTime : team.meetingSchedule?.time,
      location: meetingLocation !== undefined ? meetingLocation : team.meetingSchedule?.location
    };
  }
  
  if (goals !== undefined) team.goals = Array.isArray(goals) ? goals : [];

  await team.save();
  await team.populate('leader', 'name email avatar');

  res.json({ success: true, message: 'Team updated successfully', data: team });
});

// Delete team
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) throw new AppError('Team not found', 404);

  const leaderId = team.leader?._id || team.leader;
  if (leaderId.toString() !== req.user.id.toString() && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to delete this team', 403);
  }

  await Team.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Team deleted successfully' });
});

// Add member to team
export const addMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const teamId = req.params.id;

  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Team not found', 404);

  const leaderId = team.leader?._id || team.leader;
  if (leaderId.toString() !== req.user.id.toString() && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to add members to this team', 403);
  }

  const activeMembers = team.members.filter(m => m.isActive);
  if (activeMembers.length >= team.maxMembers) {
    throw new AppError('Team is full', 400);
  }

  const existingMember = team.members.find(m => m.user.toString() === userId.toString());

  if (existingMember) {
    if (existingMember.isActive) {
      throw new AppError('User is already a member of this team', 400);
    }
    existingMember.isActive = true;
    existingMember.role = role || 'member';
    await team.save();
    return res.json({ success: true, message: 'Member reactivated successfully', data: existingMember });
  }

  team.members.push({ user: userId, role: role || 'member' });
  await team.save();

  res.json({ success: true, message: 'Member added successfully', data: team.members[team.members.length - 1] });
});

// Remove member from team
export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const teamId = req.params.id;

  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Team not found', 404);

  const leaderId = team.leader?._id || team.leader;
  if (leaderId.toString() !== req.user.id.toString() && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to remove members from this team', 403);
  }

  if (leaderId.toString() === userId.toString()) throw new AppError('Cannot remove the team leader', 400);

  const member = team.members.find(m => m.user.toString() === userId.toString());
  if (!member || !member.isActive) throw new AppError('User is not a member of this team', 400);

  member.isActive = false;
  await team.save();

  res.json({ success: true, message: 'Member removed successfully' });
});

// Update member role
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const teamId = req.params.id;

  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Team not found', 404);

  const leaderId = team.leader?._id || team.leader;
  if (leaderId.toString() !== req.user.id.toString() && !['admin', 'leader'].includes(req.user.role)) {
    throw new AppError('Not authorized to update member roles', 403);
  }

  const member = team.members.find(m => m.user.toString() === userId.toString());
  if (!member || !member.isActive) throw new AppError('User is not a member of this team', 400);

  member.role = role;
  await team.save();

  res.json({ success: true, message: 'Member role updated successfully', data: member });
});

// Get user's teams
export const getUserTeams = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const teams = await Team.find({
    $or: [
      { leader: userId, isActive: true },
      { 'members.user': userId, 'members.isActive': true }
    ]
  }).populate('leader', 'name email avatar');

  res.json({ success: true, data: teams });
});

// Join team (for public teams)
export const joinTeam = asyncHandler(async (req, res) => {
  const teamId = req.params.id;
  const userId = req.user.id;

  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Team not found', 404);
  if (!team.isActive) throw new AppError('Team is not active', 400);
  if (!team.isPublic) throw new AppError('This team is not accepting new members', 400);
  
  const activeMembers = team.members.filter(m => m.isActive);
  if (activeMembers.length >= team.maxMembers) throw new AppError('Team is full', 400);

  const existingMember = team.members.find(m => m.user.toString() === userId.toString());

  if (existingMember) {
    if (existingMember.isActive) throw new AppError('You are already a member of this team', 400);
    existingMember.isActive = true;
    await team.save();
    return res.json({ success: true, message: 'Successfully rejoined the team', data: existingMember });
  }

  team.members.push({ user: userId, role: 'member' });
  await team.save();

  res.json({ success: true, message: 'Successfully joined the team', data: team.members[team.members.length - 1] });
});

// Leave team
export const leaveTeam = asyncHandler(async (req, res) => {
  const teamId = req.params.id;
  const userId = req.user.id;

  const team = await Team.findById(teamId);
  if (!team) throw new AppError('Team not found', 404);
  
  const leaderId = team.leader?._id || team.leader;
  if (leaderId.toString() === userId.toString()) throw new AppError('Team leader cannot leave. Transfer leadership or delete the team.', 400);

  const member = team.members.find(m => m.user.toString() === userId.toString());
  if (!member || !member.isActive) throw new AppError('You are not a member of this team', 400);

  member.isActive = false;
  await team.save();

  res.json({ success: true, message: 'Successfully left the team' });
});
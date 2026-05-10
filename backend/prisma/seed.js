import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Clear existing data (Optional, be careful in production)
  await prisma.eventAttendee.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin User
  const salt = await bcrypt.genSalt(12);
  const adminPassword = await bcrypt.hash('Password123!', salt);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@aastufocus.com',
      password: adminPassword,
      role: 'admin',
      department: 'Computer Science',
      yearOfStudy: 4,
      isActive: true,
    },
  });
  console.log('✅ Admin user created');

  // 3. Create a Team
  const worshipTeam = await prisma.team.create({
    data: {
      name: 'Worship Team',
      description: 'Leading the fellowship in spiritual worship.',
      category: 'worship',
      leaderId: admin.id,
      meetingDay: 'saturday',
      meetingTime: '10:00',
      meetingLocation: 'Main Hall',
      goals: ['Spiritual growth', 'Musical excellence'],
    },
  });
  console.log('✅ Worship Team created');

  // 4. Create an Event
  const fellowshipEvent = await prisma.event.create({
    data: {
      title: 'Grand Fellowship Night',
      description: 'A night of worship and fellowship for all members.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      startTime: '18:00',
      endTime: '21:00',
      location: 'AASTU Auditorium',
      category: 'fellowship',
      maxAttendees: 200,
      userId: admin.id,
      tags: ['worship', 'community'],
    },
  });
  console.log('✅ Sample Event created');

  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

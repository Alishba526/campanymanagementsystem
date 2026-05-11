import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database for real data entry...');

  // Clear all transactional data
  await prisma.auditLog.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.income.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.taskLog.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  // ONLY keep the core system users/roles so you can login
  const users = [
    { email: 'admin@nexaerp.com', password: 'admin123', role: 'admin', name: 'Zohaib Khan (Boss)' },
    { email: 'ecommerce@nexaerp.com', password: 'eCommerce123', role: 'ecommerce', name: 'Farhan Sheikh' },
    { email: 'marketing@nexaerp.com', password: 'marketing123', role: 'marketing', name: 'Sarah Ahmed' },
    { email: 'architecture@nexaerp.com', password: 'architecture123', role: 'architecture', name: 'Umer Qureshi' }
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  console.log('Database cleaned! All dummy data removed.');
  console.log('System is now ready for real data entry.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

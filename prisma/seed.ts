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
    { email: 'admin@growzix.com', password: 'Admin@2024#Secure', role: 'admin', name: 'Usman Haider' },
    { email: 'ecommerce@growzix.com', password: 'Ecom$Manager789', role: 'ecommerce', name: 'Manager Ecommerce' },
    { email: 'marketing@growzix.com', password: 'Market!ng456Pro', role: 'marketing', name: 'Manager Marketing' },
    { email: 'architecture@growzix.com', password: 'Arch#Tech321Mgr', role: 'architecture', name: 'Manager Architecture' }
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

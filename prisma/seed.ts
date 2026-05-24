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
    { email: 'superadmin@growzix.com', password: 'SuperAdmin@2024#', role: 'superadmin', name: 'Super Admin' },
    { email: 'admin@growzix.com', password: 'Admin@2024#Secure', role: 'admin', name: 'Usman Haider' },
    { email: 'ecommerce@growzix.com', password: 'Ecom$Manager789', role: 'ecommerce', name: 'Manager Ecommerce' },
    { email: 'marketing@growzix.com', password: 'Market!ng456Pro', role: 'marketing', name: 'Manager Marketing' },
    { email: 'architecture@growzix.com', password: 'Arch#Tech321Mgr', role: 'architecture', name: 'Manager Architecture' }
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  console.log('Adding specific employees requested by user...');
  
  const requestedEmployees = [
    {
      id: 'emp001',
      name: 'ayesha',
      fatherName: 'ramzan',
      department: 'ecommerce',
      position: 'senior',
      address: 'pakistan',
      phone: '03345678910',
      email: 'ayesha@growzix.com',
      salary: 200000,
      status: 'active',
      joinDate: '2026-05-22',
      monthlyHours: 176
    },
    {
      id: 'EMp-001',
      name: 'subhan',
      fatherName: 'ramzan',
      department: 'ecommerce',
      position: 'developer',
      address: 'pakistan',
      phone: '03321234567',
      email: 'subhan@growzix.com',
      salary: 80000,
      status: 'inactive',
      joinDate: '2026-05-22',
      monthlyHours: 176
    },
    {
      id: 'AMZ-0001',
      name: 'Tahmoor',
      fatherName: 'Riaz',
      department: 'marketing',
      position: 'marketing specialist',
      address: '--',
      phone: '030136996039',
      email: 'tahmoor@growzix.com',
      salary: 0,
      status: 'active',
      joinDate: '2026-01-01',
      monthlyHours: 176
    },
    {
      id: 'ARCH-001',
      name: 'Abdullah',
      fatherName: 'Faisal',
      department: 'architecture',
      position: 'system designer',
      address: 'pakistan',
      phone: '03214567890',
      email: 'abdullah@growzix.com',
      salary: 120000,
      status: 'active',
      joinDate: '2026-05-24',
      monthlyHours: 176
    }
  ];

  for (const emp of requestedEmployees) {
    await prisma.employee.create({ data: emp });
    // Also create a user account for them to login
    await prisma.user.create({
      data: {
        email: emp.email,
        password: 'Growzix@2026#', // Default password
        role: emp.department === 'ecommerce' ? 'ecommerce' : (emp.department === 'marketing' ? 'marketing' : 'employee'),
        name: emp.name
      }
    });
  }

  console.log('Employees added successfully!');
  console.log('Database cleaned and seeded! All dummy data removed.');
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

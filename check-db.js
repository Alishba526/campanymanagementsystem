
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnection() {
  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('Connected successfully!');
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
  } catch (error) {
    console.error('Connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();

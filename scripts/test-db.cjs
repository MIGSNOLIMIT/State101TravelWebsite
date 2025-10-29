// scripts/test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Try to fetch all users
    const users = await prisma.user.findMany();
    console.log('✅ Database connected! User count:', users.length);
    if (users.length > 0) {
      console.log('Sample user:', users[0]);
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

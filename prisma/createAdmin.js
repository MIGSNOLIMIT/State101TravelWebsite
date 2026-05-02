// Run this script with: node prisma/createAdmin.js
// Make sure to install bcryptjs: npm install bcryptjs

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'statetravel101@gmail.com';
  const password = '12345';
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: 'admin' },
    create: {
      email,
      password: hashed,
      role: 'admin',
    },
  });

  console.log('Super admin user created/updated:', user.email);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

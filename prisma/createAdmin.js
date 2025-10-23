// Run this script with: node prisma/createAdmin.js
// Make sure to install bcryptjs: npm install bcryptjs

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'migsnolimit23@gmail.com'; // Change to your admin Gmail
  const password = '12345'; // Change to your desired password
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    create: {
      email,
      password: hashed,
    },
  });

  console.log('Admin user created/updated:', user.email);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create super admin user
  const hashedPassword = await bcrypt.hash('26@2705n8n', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'bandujar@edutac.es' },
    update: {},
    create: {
      email: 'bandujar@edutac.es',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Administrator',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log('✅ Super admin user created:', superAdmin.email);

  // Create a sample centre
  const centre = await prisma.centre.upsert({
    where: { codi: 'CENTRE001' },
    update: {},
    create: {
      nom: 'Centre Educatiu d\'Exemple',
      codi: 'CENTRE001',
      emailDomain: 'exemple.edu',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Sample centre created:', centre.nom);

  // Create a sample course
  const curs = await prisma.curs.upsert({
    where: { codi: 'CURS001' },
    update: {},
    create: {
      nom: 'Primer Curs d\'Exemple',
      codi: 'CURS001',
      anyAcademic: 2024,
      status: 'ACTIVE',
      centreId: centre.id,
    },
  });

  console.log('✅ Sample course created:', curs.nom);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

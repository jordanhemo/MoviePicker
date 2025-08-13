import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Streaming services can be configured via environment variables or database seeding
// This is a minimal set for development - in production, this would come from a configuration file
const streamingServices = [
  {
    name: 'netflix',
    displayName: 'Netflix',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'
  },
  {
    name: 'disney_plus',
    displayName: 'Disney+',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg'
  },
  {
    name: 'hbo_max',
    displayName: 'HBO Max',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg'
  }
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Only seed if explicitly enabled via environment variable
    if (process.env['ENABLE_SEEDING'] !== 'true') {
      console.log('⚠️  Seeding disabled. Set ENABLE_SEEDING=true to enable.');
      return;
    }

    // Seed streaming services
    console.log('📺 Seeding streaming services...');
    for (const service of streamingServices) {
      await prisma.streamingService.upsert({
        where: { name: service.name },
        update: service,
        create: service
      });
    }
    console.log(`✅ Seeded ${streamingServices.length} streaming services`);

    // Create a test user only in development
    if (process.env['NODE_ENV'] === 'development' && process.env['CREATE_TEST_USER'] === 'true') {
      console.log('👤 Creating test user...');
      const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQZxKz6O', // password: test123
          location: 'United States'
        }
      });

      // Add some streaming services to test user
      const netflix = await prisma.streamingService.findUnique({ where: { name: 'netflix' } });
      const disney = await prisma.streamingService.findUnique({ where: { name: 'disney_plus' } });

      if (netflix && disney) {
        await prisma.userStreamingService.createMany({
          data: [
            {
              userId: testUser.id,
              streamingServiceId: netflix.id,
              isActive: true
            },
            {
              userId: testUser.id,
              streamingServiceId: disney.id,
              isActive: true
            }
          ],
          skipDuplicates: true
        });
      }

      console.log('✅ Test user created successfully');
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

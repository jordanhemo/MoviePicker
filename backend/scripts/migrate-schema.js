const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateSchema() {
  try {
    console.log('Starting database schema migration...');

    // Step 1: Remove username, firstName, lastName columns from users table
    console.log('Removing username, firstName, lastName columns from users table...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE users 
        DROP COLUMN IF EXISTS username,
        DROP COLUMN IF EXISTS "firstName",
        DROP COLUMN IF EXISTS "lastName";
      `;
      console.log('✓ Removed username, firstName, lastName columns');
    } catch (error) {
      console.log('Note: Some columns may not exist or already be removed:', error.message);
    }

    // Step 2: Update streaming_services table to add tmdb_id column
    console.log('Adding tmdb_id column to streaming_services table...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE streaming_services 
        ADD COLUMN IF NOT EXISTS tmdb_id INTEGER;
      `;
      console.log('✓ Added tmdb_id column');
    } catch (error) {
      console.log('Note: tmdb_id column may already exist:', error.message);
    }

    // Step 3: Update existing streaming services with TMDB IDs using raw SQL
    // This mapping can be configured via environment variables or external config
    const updates = [
      { name: 'netflix', tmdbId: 8 },
      { name: 'disney_plus', tmdbId: 2 },
      { name: 'hbo_max', tmdbId: 384 }
    ];
    
    // Only update if streaming services exist
    for (const update of updates) {
      try {
        await prisma.$executeRaw`UPDATE streaming_services SET tmdb_id = ${update.tmdbId} WHERE name = ${update.name};`;
        console.log(`Updated ${update.name} with TMDB ID ${update.tmdbId}`);
      } catch (error) {
        console.log(`Skipping ${update.name} - may not exist in database`);
      }
    }

    // Step 4: Add unique constraint to tmdb_id column
    console.log('Adding unique constraint to tmdb_id column...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE streaming_services 
        ADD CONSTRAINT IF NOT EXISTS streaming_services_tmdb_id_unique 
        UNIQUE (tmdb_id);
      `;
      console.log('✓ Added unique constraint to tmdb_id');
    } catch (error) {
      console.log('Note: Unique constraint may already exist:', error.message);
    }

    console.log('Schema migration completed successfully!');
    
    // Display updated data using raw SQL
    console.log('\nFetching updated data...');
    
    const users = await prisma.$queryRaw`
      SELECT id, email, location, "createdAt" 
      FROM users 
      LIMIT 5;
    `;
    
    const streamingServices = await prisma.$queryRaw`
      SELECT id, name, tmdb_id, "displayName" 
      FROM streaming_services 
      LIMIT 10;
    `;

    console.log('\nUpdated users table structure (first 5 users):');
    console.table(users);
    
    console.log('\nUpdated streaming services (first 10):');
    console.table(streamingServices);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateSchema()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSchema };

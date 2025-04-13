import { createUsersTable } from "./migrations/user.migration.js";

async function migrate() {
    try {
      console.log('🧹 Dropping and recreating tables...');
      await createUsersTable();
      console.log('🎉 Migration completed.');
      process.exit(0);
    } catch (err) {
      console.error('Migration failed:', err);
      process.exit(1);
    }
  }

migrate();
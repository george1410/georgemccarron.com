import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import 'dotenv/config';

const runMigration = async () => {
  if (!process.env.DB_CONNECTION_STRING) {
    throw new Error('DB_CONNECTION_STRING is not defined');
  }

  const connection = postgres(process.env.DB_CONNECTION_STRING, {
    max: 1,
    onnotice: () => {},
  });

  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();

  await migrate(db, { migrationsFolder: 'drizzle' });

  const end = Date.now();

  console.log(`✅ Migrations completed in ${end - start}ms`);

  await connection.end();
};

runMigration().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});

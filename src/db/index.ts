import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '@/env';

const connection = postgres(env.DB_CONNECTION_STRING, { onnotice: () => {} });

export const db = drizzle(connection, { schema });

import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  let dbHealth;
  try {
    const [res] = await db.execute<{ healthy: boolean }>(
      sql`SELECT true as healthy`
    );
    dbHealth = res.healthy;
  } catch (err) {
    dbHealth = false;
  }

  return Response.json(
    {
      db: dbHealth,
    },
    { status: dbHealth ? 200 : 503 }
  );
}

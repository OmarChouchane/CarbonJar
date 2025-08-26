import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../lib/db/schema';

const getHandler = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });

  await client.connect();
  const topics = await db.select().from(schema.carbonTopics);
  await client.end();
  return NextResponse.json(topics);
};
export const GET = getHandler;

const postHandler = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });

  const dataUnknown = (await req.json()) as unknown;
  type TopicInsert = typeof schema.carbonTopics.$inferInsert;
  const data = dataUnknown as Partial<TopicInsert>;
  const payload: TopicInsert = {
    name: typeof data.name === 'string' ? data.name : '',
    description: typeof data.description === 'string' ? data.description : null,
  };
  await client.connect();
  const inserted = await db.insert(schema.carbonTopics).values(payload).returning();
  await client.end();
  return NextResponse.json(inserted[0]);
};
export const POST = postHandler;

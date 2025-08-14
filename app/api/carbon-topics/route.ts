import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../lib/db/schema";


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

  const data = await req.json();
  await client.connect();
  const inserted = await db
    .insert(schema.carbonTopics)
    .values(data)
    .returning();
  await client.end();
  return NextResponse.json(inserted[0]);
};
export const POST = postHandler;

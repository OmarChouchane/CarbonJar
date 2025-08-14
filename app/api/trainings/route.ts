import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "@/lib/db/schema";

const getHandler = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  const trainings = await db.select().from(schema.courses);
  await client.end();
  return NextResponse.json(trainings);
};
export const GET = getHandler;

const postHandler = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  const data = await req.json();
  const inserted = await db.insert(schema.courses).values(data).returning();
  await client.end();
  return NextResponse.json(inserted[0]);
};
export const POST = postHandler;

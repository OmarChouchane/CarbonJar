import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../lib/db/schema";

const client = new Client({ connectionString: process.env.DATABASE_URL });
const db = drizzle(client, { schema });

const getHandler = async () => {
  await client.connect();
  const questions = await db.select().from(schema.questions);
  await client.end();
  return NextResponse.json(questions);
};
export const GET = getHandler;

const postHandler = async (req: NextRequest) => {
  const data = await req.json();
  await client.connect();
  const inserted = await db.insert(schema.questions).values(data).returning();
  await client.end();
  return NextResponse.json(inserted[0]);
};
export const POST = postHandler;

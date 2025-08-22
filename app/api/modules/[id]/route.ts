import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  const { id } = params;
  await client.connect();
  const moduleData = await db
    .select()
    .from(schema.modules)
    .where(eq(schema.modules.moduleId, id));
  await client.end();
  return NextResponse.json(moduleData[0] || null);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  const { id } = params;
  const data = await request.json();
  await client.connect();
  const updated = await db
    .update(schema.modules)
    .set(data)
    .where(eq(schema.modules.moduleId, id))
    .returning();
  await client.end();
  return NextResponse.json(updated[0] || null);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  const { id } = params;
  await client.connect();
  const deleted = await db
    .delete(schema.modules)
    .where(eq(schema.modules.moduleId, id))
    .returning();
  await client.end();
  return NextResponse.json(deleted[0] || null);
}

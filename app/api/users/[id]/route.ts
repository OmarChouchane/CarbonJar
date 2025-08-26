import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../../lib/db/schema';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });

  const { id } = await context.params;
  await client.connect();
  const user = await db
    .select()
    .from(schema.authUsers)
    .where(eq(schema.authUsers.userId, id))
    .orderBy(desc(schema.authUsers.createdAt));
  await client.end();
  return NextResponse.json(user[0] || null);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });

  const { id } = await context.params;
  const json = (await request.json()) as unknown;
  const data = json as Partial<typeof schema.authUsers.$inferInsert>;
  await client.connect();
  const updated = await db
    .update(schema.authUsers)
    .set(data)
    .where(eq(schema.authUsers.userId, id))
    .returning();
  await client.end();
  return NextResponse.json(updated[0] || null);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });

  const { id } = await context.params;
  await client.connect();
  const deleted = await db
    .delete(schema.authUsers)
    .where(eq(schema.authUsers.userId, id))
    .returning();
  await client.end();
  return NextResponse.json(deleted[0] || null);
}

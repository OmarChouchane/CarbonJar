import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../../lib/db/schema';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  const { id } = await params;
  await client.connect();
  const moduleData = await db.select().from(schema.modules).where(eq(schema.modules.moduleId, id));
  await client.end();
  return NextResponse.json(moduleData[0] || null);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  const { id } = await params;
  const dataUnknown = (await request.json()) as unknown;
  type ModuleInsert = typeof schema.modules.$inferInsert;
  const data = dataUnknown as Partial<ModuleInsert>;
  await client.connect();
  const updated = await db
    .update(schema.modules)
    .set({
      ...(typeof data.title === 'string' ? { title: data.title } : {}),
      ...(typeof data.content === 'string' ? { content: data.content } : {}),
      ...(() => {
        const valid = schema.contentType.enumValues as readonly string[];
        const isType = (v: unknown): v is (typeof schema.contentType.enumValues)[number] =>
          typeof v === 'string' && valid.includes(v);
        return isType(data.contentType) ? { contentType: data.contentType } : {};
      })(),
      ...(typeof data.order === 'number' && Number.isFinite(data.order)
        ? { order: data.order }
        : {}),
      ...(typeof data.estimatedDuration === 'number' && Number.isFinite(data.estimatedDuration)
        ? { estimatedDuration: data.estimatedDuration }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.modules.moduleId, id))
    .returning();
  await client.end();
  return NextResponse.json(updated[0] || null);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  const { id } = await params;
  await client.connect();
  const deleted = await db
    .delete(schema.modules)
    .where(eq(schema.modules.moduleId, id))
    .returning();
  await client.end();
  return NextResponse.json(deleted[0] || null);
}

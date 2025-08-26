import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../../lib/db/schema';

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function withDb<T>(
  fn: (db: NodePgDatabase<typeof schema>, client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const db = drizzle(client, { schema });
    return await fn(db, client);
  } finally {
    await client.end();
  }
}

// GET /api/certificates/[id]  (id can be certificateId UUID or certificateCode)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const byCode = !isUuid(id);
  const keyCol = byCode ? schema.certificates.certificateCode : schema.certificates.certificateId;

  const record = await withDb(async (db) => {
    const rows = await db.select().from(schema.certificates).where(eq(keyCol, id)).limit(1);
    return rows[0] ?? null;
  });

  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(record);
}

// PUT /api/certificates/[id]   (revoke/update fields)
// Body supports: { isRevoked?: boolean, revokedReason?: string | null, pdfUrl?: string, title?: string, description?: string, validUntil?: string | null }
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const byCode = !isUuid(id);
  const keyCol = byCode ? schema.certificates.certificateCode : schema.certificates.certificateId;

  const bodyUnknown = (await request.json().catch(() => ({}))) as unknown;
  const body = bodyUnknown as Partial<{
    isRevoked: boolean;
    revokedReason: string | null;
    pdfUrl: string;
    title: string;
    description: string;
    validUntil: string | null;
  }>;

  const update: Partial<typeof schema.certificates.$inferInsert> = {};
  if (typeof body.isRevoked === 'boolean') update.isRevoked = body.isRevoked;
  if (body.revokedReason === null || typeof body.revokedReason === 'string')
    update.revokedReason = body.revokedReason;
  if (typeof body.pdfUrl === 'string') update.pdfUrl = body.pdfUrl;
  if (typeof body.title === 'string') update.title = body.title;
  if (typeof body.description === 'string') update.description = body.description;

  if (body.validUntil === null) update.validUntil = null;
  else if (typeof body.validUntil === 'string' && body.validUntil)
    update.validUntil = new Date(body.validUntil);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const updated = await withDb(async (db) => {
    const rows = await db.update(schema.certificates).set(update).where(eq(keyCol, id)).returning();
    return rows[0] ?? null;
  });

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

// DELETE /api/certificates/[id]  (id can be certificateId UUID or certificateCode)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const byCode = !isUuid(id);
  const keyCol = byCode ? schema.certificates.certificateCode : schema.certificates.certificateId;

  const deleted = await withDb(async (db) => {
    const rows = await db.delete(schema.certificates).where(eq(keyCol, id)).returning();
    return rows[0] ?? null;
  });

  return NextResponse.json(deleted || null);
}

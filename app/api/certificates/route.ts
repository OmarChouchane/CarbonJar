import { randomUUID } from 'crypto';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '@/lib/db/schema';

export const GET = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();
  const certificates = await db.select().from(schema.certificates);
  await client.end();
  return NextResponse.json(certificates);
};

export const POST = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  const dataUnknown = (await req.json()) as unknown;
  type CertInsert = typeof schema.certificates.$inferInsert;
  const data = dataUnknown as Partial<CertInsert> & {
    courseStartDate?: string | Date | null;
    courseEndDate?: string | Date | null;
    issueDate?: string | Date | null;
    validUntil?: string | Date | null;
  };
  const certificateCode = Math.floor(1000 + Math.random() * 9000).toString();
  const fullName = typeof data.fullName === 'string' ? data.fullName : '';
  const title = typeof data.title === 'string' ? data.title : '';
  const certificateSlug = `${fullName.replace(/\s+/g, '-').toLowerCase()}-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const certificateHash = randomUUID();

  // Normalize date fields
  const courseStartDate = toPlainDate(data.courseStartDate);
  const courseEndDate = toPlainDate(data.courseEndDate);
  if (!courseStartDate || !courseEndDate) {
    return NextResponse.json(
      { error: 'courseStartDate and courseEndDate are required in YYYY-MM-DD format' },
      { status: 400 },
    );
  }
  const normalized: CertInsert = {
    userId: typeof data.userId === 'string' ? data.userId : '',
    courseId: typeof data.courseId === 'string' ? data.courseId : '',
    fullName,
    title,
    description: typeof data.description === 'string' ? data.description : '',
    courseStartDate,
    courseEndDate,
    issueDate: normalizeDateField(data.issueDate) ?? new Date(),
    validUntil: normalizeDateField(data.validUntil),
    certificateCode,
    certificateSlug,
    certificateHash,
    issuerName: 'Oussama Ben Abdessalem',
    issuerRole: 'CEO of Carbon Jar',
    pdfUrl: typeof data.pdfUrl === 'string' ? data.pdfUrl : '',
    isRevoked: false,
    revokedReason: null,
  };
  /*console.log("Incoming data:", data);
  console.log("Normalized data:", normalized);*/
  await client.connect();
  console.log(
    'Normalized data types:',
    Object.entries(normalized).map(([k, v]) => [k, typeof v, v]),
  );

  try {
    const inserted = await db.insert(schema.certificates).values(normalized).returning();
    await client.end();
    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.error('Insert error:', err);
    await client.end();
    const errorMessage =
      typeof err === 'object' && err !== null && 'message' in err
        ? (err as { message: string }).message
        : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};

function toPlainDate(value: unknown): string | null {
  if (!value || (typeof value !== 'string' && !(value instanceof Date))) return null;

  const trimmed =
    typeof value === 'string'
      ? value.trim()
      : value instanceof Date
        ? value.toISOString().slice(0, 10)
        : '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return null;

  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function normalizeDateField(value: unknown): Date | null {
  if (!value || (typeof value !== 'string' && !(value instanceof Date))) return null;

  const trimmed =
    typeof value === 'string'
      ? value.trim()
      : value instanceof Date
        ? value.toISOString().slice(0, 10)
        : '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return null;

  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return null;

  return date; // Return Date object for Drizzle/Postgres
}

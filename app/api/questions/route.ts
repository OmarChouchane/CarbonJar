import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../lib/db/schema';

const getHandler = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  const questions = await db.select().from(schema.questions);
  await client.end();
  return NextResponse.json(questions);
};
export const GET = getHandler;

const postHandler = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  const dataUnknown = (await req.json()) as unknown;
  type QuestionInsert = typeof schema.questions.$inferInsert;
  const data = dataUnknown as Partial<QuestionInsert>;
  const payload: QuestionInsert = {
    assessmentId: typeof data.assessmentId === 'string' ? data.assessmentId : '',
    text: typeof data.text === 'string' ? data.text : '',
    options:
      Array.isArray(data.options) || typeof data.options === 'object'
        ? (data.options as QuestionInsert['options'])
        : null,
    correctAnswer: typeof data.correctAnswer === 'string' ? data.correctAnswer : null,
    explanation: typeof data.explanation === 'string' ? data.explanation : null,
    order: typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : 1,
  };
  const inserted = await db.insert(schema.questions).values(payload).returning();
  await client.end();
  return NextResponse.json(inserted[0]);
};
export const POST = postHandler;

import { auth } from '@clerk/nextjs/server';
import { eq, asc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../../../lib/db/schema';

export const GET = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

  const { id } = await context.params;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    await client.connect();
    const questions = await db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.assessmentId, id))
      .orderBy(asc(schema.questions.order));
    await client.end();

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const POST = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

  const { id } = await context.params;
    const dataUnknown = (await request.json()) as unknown;
    type QuestionInsert = typeof schema.questions.$inferInsert;
    const data = dataUnknown as Partial<QuestionInsert> & {
      options?: unknown;
    };

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    // Prepare question data
    const questionData: QuestionInsert = {
      assessmentId: id,
      text: typeof data.text === 'string' ? data.text : '',
      options:
        Array.isArray(data.options) || typeof data.options === 'object'
          ? (data.options as QuestionInsert['options'])
          : null,
      correctAnswer: typeof data.correctAnswer === 'string' ? data.correctAnswer : null,
      explanation: typeof data.explanation === 'string' ? data.explanation : null,
      order: typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : 1,
    };

    await client.connect();
    const inserted = await db.insert(schema.questions).values(questionData).returning();
    await client.end();

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error('Failed to create question:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

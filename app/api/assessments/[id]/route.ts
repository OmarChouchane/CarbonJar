import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../../lib/db/schema';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { id } = await context.params;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    await client.connect();
    const assessment = await db
      .select()
      .from(schema.assessments)
      .where(eq(schema.assessments.assessmentId, id));
    await client.end();

    return NextResponse.json(assessment[0] || null);
  } catch (error) {
    console.error('Failed to fetch assessment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { id } = await context.params;
    const dataUnknown = (await request.json()) as unknown;
    type AssessmentUpdate = Partial<typeof schema.assessments.$inferInsert>;
    const data = dataUnknown as AssessmentUpdate;

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    await client.connect();
    const updated = await db
      .update(schema.assessments)
      .set({
        ...(typeof data.assessmentType === 'string' &&
        schema.assessmentType.enumValues.includes(data.assessmentType)
          ? {
              assessmentType: data.assessmentType,
            }
          : {}),
        ...(typeof data.maxScore === 'number' && Number.isFinite(data.maxScore)
          ? { maxScore: data.maxScore }
          : {}),
        ...(typeof data.passingScore === 'number' && Number.isFinite(data.passingScore)
          ? { passingScore: data.passingScore }
          : {}),
        ...(typeof data.timeLimit === 'number' && Number.isFinite(data.timeLimit)
          ? { timeLimit: data.timeLimit }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.assessments.assessmentId, id))
      .returning();
    await client.end();

    return NextResponse.json(updated[0] || null);
  } catch (error) {
    console.error('Failed to update assessment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { id } = await context.params;

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    await client.connect();
    const deleted = await db
      .delete(schema.assessments)
      .where(eq(schema.assessments.assessmentId, id))
      .returning();
    await client.end();

    return NextResponse.json(deleted[0] || null);
  } catch (error) {
    console.error('Failed to delete assessment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

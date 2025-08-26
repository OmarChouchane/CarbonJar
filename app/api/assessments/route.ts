import { auth } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../lib/db/schema';

export const GET = async (_req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    await client.connect();

    // Build the query with joins to get module and course information
    const assessments = await db
      .select({
        assessmentId: schema.assessments.assessmentId,
        moduleId: schema.assessments.moduleId,
        assessmentType: schema.assessments.assessmentType,
        maxScore: schema.assessments.maxScore,
        passingScore: schema.assessments.passingScore,
        timeLimit: schema.assessments.timeLimit,
        createdAt: schema.assessments.createdAt,
        updatedAt: schema.assessments.updatedAt,
        moduleTitle: schema.modules.title,
        courseTitle: schema.courses.title,
      })
      .from(schema.assessments)
      .leftJoin(schema.modules, eq(schema.assessments.moduleId, schema.modules.moduleId))
      .leftJoin(schema.courses, eq(schema.modules.courseId, schema.courses.courseId))
      .orderBy(desc(schema.assessments.createdAt));

    await client.end();

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    const dataUnknown = (await req.json()) as unknown;
    type AssessmentInsert = typeof schema.assessments.$inferInsert;
    const data = dataUnknown as Partial<AssessmentInsert>;

    // Validate required fields
    const validTypes = schema.assessmentType.enumValues as readonly string[];
    const isAssessmentType = (v: unknown): v is (typeof schema.assessmentType.enumValues)[number] =>
      typeof v === 'string' && validTypes.includes(v);
    const moduleId = typeof data.moduleId === 'string' ? data.moduleId : '';
    if (!moduleId) {
      return NextResponse.json({ message: 'moduleId is required' }, { status: 400 });
    }
    const assessmentType = isAssessmentType(data.assessmentType) ? data.assessmentType : undefined;
    if (!assessmentType) {
      return NextResponse.json(
        { message: `assessmentType must be one of ${validTypes.join(', ')}` },
        { status: 400 },
      );
    }

    // Prepare the assessment data
    const assessmentData: AssessmentInsert = {
      moduleId,
      assessmentType,
      maxScore:
        typeof data.maxScore === 'number' && Number.isFinite(data.maxScore) ? data.maxScore : 100,
      passingScore:
        typeof data.passingScore === 'number' && Number.isFinite(data.passingScore)
          ? data.passingScore
          : 50,
      timeLimit:
        typeof data.timeLimit === 'number' && Number.isFinite(data.timeLimit)
          ? data.timeLimit
          : null,
    };

    await client.connect();
    const inserted = await db.insert(schema.assessments).values(assessmentData).returning();
    await client.end();

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error('Failed to create assessment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

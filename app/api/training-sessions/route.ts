import { auth } from '@clerk/nextjs/server';
import { eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db/drizzle';
import { trainingSessions, courses, authUsers } from '@/lib/db/schema';

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const db = getDb();

    // Get training sessions with course and instructor details
    const sessions = await db
      .select({
        sessionId: trainingSessions.sessionId,
        courseId: trainingSessions.courseId,
        startTime: trainingSessions.startTime,
        endTime: trainingSessions.endTime,
        instructorId: trainingSessions.instructorId,
        maxParticipants: trainingSessions.maxParticipants,
        createdAt: trainingSessions.createdAt,
        updatedAt: trainingSessions.updatedAt,
        courseTitle: courses.title,
        instructorName: sql<string>`CONCAT(${authUsers.firstName}, ' ', ${authUsers.lastName})`,
      })
      .from(trainingSessions)
      .leftJoin(courses, eq(trainingSessions.courseId, courses.courseId))
      .leftJoin(authUsers, eq(trainingSessions.instructorId, authUsers.userId));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching training sessions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const db = getDb();
    // Fetch DB role from auth_users by clerkId=userId
    const who = await db
      .select({ role: authUsers.role })
      .from(authUsers)
      .where(eq(authUsers.clerkId, userId))
      .limit(1);
    const role = who[0]?.role;
    if (role !== 'trainer' && role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }
    const bodyUnknown = (await request.json()) as unknown;
    type CreatePayload = {
      courseId: string;
      startTime: string;
      endTime: string;
      instructorId?: string | null;
      maxParticipants?: number | null;
    };
    const body = bodyUnknown as Partial<CreatePayload>;
    const { courseId, startTime, endTime, instructorId, maxParticipants } = body;

    // Validate required fields
    if (!courseId || !startTime || !endTime) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Create new training session
    const newSession = await db
      .insert(trainingSessions)
      .values({
        courseId: String(courseId),
        startTime: new Date(String(startTime)),
        endTime: new Date(String(endTime)),
        instructorId: typeof instructorId === 'string' ? instructorId : null,
        maxParticipants: typeof maxParticipants === 'number' ? maxParticipants : null,
      })
      .returning();

    return NextResponse.json(newSession[0]);
  } catch (error) {
    console.error('Error creating training session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

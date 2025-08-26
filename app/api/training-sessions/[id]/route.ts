import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db/drizzle';
import { trainingSessions, authUsers } from '@/lib/db/schema';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

  const { id } = await params;
    const db = getDb();
    // DB role check
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
    type UpdatePayload = Partial<{
      courseId: string;
      startTime: string;
      endTime: string;
      instructorId: string | null;
      maxParticipants: number | null;
    }>;
    const body = bodyUnknown as UpdatePayload;
    const { courseId, startTime, endTime, instructorId, maxParticipants } = body;

    // Update training session
    const updatedSession = await db
      .update(trainingSessions)
      .set({
        courseId: typeof courseId === 'string' ? courseId : undefined,
        startTime: typeof startTime === 'string' ? new Date(startTime) : undefined,
        endTime: typeof endTime === 'string' ? new Date(endTime) : undefined,
        instructorId: typeof instructorId === 'string' ? instructorId : (instructorId ?? null),
        maxParticipants:
          typeof maxParticipants === 'number' ? maxParticipants : (maxParticipants ?? null),
        updatedAt: new Date(),
      })
      .where(eq(trainingSessions.sessionId, id))
      .returning();

    if (updatedSession.length === 0) {
      return new NextResponse('Training session not found', { status: 404 });
    }

    return NextResponse.json(updatedSession[0]);
  } catch (error) {
    console.error('Error updating training session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

  const { id } = await params;
    const db = getDb();
    // DB role check
    const who = await db
      .select({ role: authUsers.role })
      .from(authUsers)
      .where(eq(authUsers.clerkId, userId))
      .limit(1);
    const role = who[0]?.role;
    if (role !== 'trainer' && role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Delete training session
    const deletedSession = await db
      .delete(trainingSessions)
      .where(eq(trainingSessions.sessionId, id))
      .returning();

    if (deletedSession.length === 0) {
      return new NextResponse('Training session not found', { status: 404 });
    }

    return NextResponse.json({
      message: 'Training session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting training session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

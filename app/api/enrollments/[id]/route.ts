import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../../lib/db/schema';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    const { id } = await params;
    const dataUnknown = (await request.json()) as unknown;
    type EnrollmentUpdate = Partial<typeof schema.enrollments.$inferInsert>;
    const data = dataUnknown as EnrollmentUpdate & {
      enrollmentDate?: string | Date | null;
    };

    // DB role check
    const me = await db
      .select({ role: schema.authUsers.role })
      .from(schema.authUsers)
      .where(eq(schema.authUsers.clerkId, userId))
      .limit(1);
    const role = me[0]?.role;
    if (role !== 'trainer' && role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await client.connect();
    const updated = await db
      .update(schema.enrollments)
      .set({
        ...(typeof data.userId === 'string' ? { userId: data.userId } : {}),
        ...(typeof data.courseId === 'string' ? { courseId: data.courseId } : {}),
        ...(typeof data.completionStatus === 'string'
          ? { completionStatus: data.completionStatus }
          : {}),
        ...(typeof data.progressPercentage === 'number' && Number.isFinite(data.progressPercentage)
          ? { progressPercentage: data.progressPercentage }
          : {}),
        ...(data.enrollmentDate ? { enrollmentDate: new Date(String(data.enrollmentDate)) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(schema.enrollments.enrollmentId, id))
      .returning();
    await client.end();

    return NextResponse.json(updated[0] || null);
  } catch (error) {
    console.error('Failed to update enrollment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    const { id } = await params;

    // DB role check
    const me = await db
      .select({ role: schema.authUsers.role })
      .from(schema.authUsers)
      .where(eq(schema.authUsers.clerkId, userId))
      .limit(1);
    const role = me[0]?.role;
    if (role !== 'trainer' && role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await client.connect();
    const deleted = await db
      .delete(schema.enrollments)
      .where(eq(schema.enrollments.enrollmentId, id))
      .returning();
    await client.end();

    return NextResponse.json({ success: true, deleted: deleted[0] });
  } catch (error) {
    console.error('Failed to delete enrollment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

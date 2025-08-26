import { auth } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../lib/db/schema';

export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    await client.connect();

    // Build the query with joins to get user and course information
    const enrollments = await db
      .select({
        enrollmentId: schema.enrollments.enrollmentId,
        userId: schema.enrollments.userId,
        courseId: schema.enrollments.courseId,
        enrollmentDate: schema.enrollments.enrollmentDate,
        progressPercentage: schema.enrollments.progressPercentage,
        completionStatus: schema.enrollments.completionStatus,
        createdAt: schema.enrollments.createdAt,
        updatedAt: schema.enrollments.updatedAt,
        userName: schema.authUsers.firstName,
        userLastName: schema.authUsers.lastName,
        userEmail: schema.authUsers.email,
        courseTitle: schema.courses.title,
      })
      .from(schema.enrollments)
      .leftJoin(schema.authUsers, eq(schema.enrollments.userId, schema.authUsers.userId))
      .leftJoin(schema.courses, eq(schema.enrollments.courseId, schema.courses.courseId))
      .orderBy(desc(schema.enrollments.enrollmentDate));

    await client.end();

    // Filter results based on search and status
    const filteredEnrollments = enrollments.filter((enrollment) => {
      const fullName = `${enrollment.userName} ${enrollment.userLastName}`.toLowerCase();
      const courseTitle = enrollment.courseTitle?.toLowerCase() || '';
      const email = enrollment.userEmail?.toLowerCase() || '';

      const matchesSearch =
        search === '' ||
        fullName.includes(search.toLowerCase()) ||
        courseTitle.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase());

      const matchesStatus = status === 'all' || enrollment.completionStatus === status;

      return matchesSearch && matchesStatus;
    });

    return NextResponse.json(filteredEnrollments);
  } catch (error) {
    console.error('Failed to fetch enrollments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    // Safely parse JSON body
    let dataUnknown: unknown;
    try {
      dataUnknown = await req.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }
    type EnrollmentInsert = typeof schema.enrollments.$inferInsert;
    const data = dataUnknown as Partial<EnrollmentInsert> & {
      enrollmentDate?: string | Date | null;
    };

    await client.connect();

    // DB role check and identity
    const me = await db
      .select({ role: schema.authUsers.role, userId: schema.authUsers.userId })
      .from(schema.authUsers)
      .where(eq(schema.authUsers.clerkId, userId))
      .limit(1);
    const role = me[0]?.role;
    const meUserId = me[0]?.userId as string | undefined;
    // Allow self-enrollment; otherwise require trainer/admin
    const isSelf = meUserId && typeof data?.userId === 'string' && data.userId === meUserId;
    if (!isSelf && role !== 'trainer' && role !== 'admin') {
      await client.end();
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Validate required fields
    if (typeof data?.userId !== 'string' || typeof data?.courseId !== 'string') {
      await client.end();
      return NextResponse.json(
        { message: 'Missing required fields: userId and courseId' },
        { status: 400 },
      );
    }

    // Prepare the enrollment data with proper timestamp handling
    const enrollmentData: EnrollmentInsert = {
      userId: data.userId,
      courseId: data.courseId,
      completionStatus:
        typeof data.completionStatus === 'string' ? data.completionStatus : 'in_progress',
      progressPercentage:
        typeof data.progressPercentage === 'number' && Number.isFinite(data.progressPercentage)
          ? data.progressPercentage
          : 0,
      ...(data.enrollmentDate ? { enrollmentDate: new Date(String(data.enrollmentDate)) } : {}),
    };

    const inserted = await db.insert(schema.enrollments).values(enrollmentData).returning();
    await client.end();

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error('Failed to create enrollment:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};

import { auth } from '@clerk/nextjs/server';
import { sql, count, desc } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db/drizzle';
import {
  authUsers,
  courses,
  certificates,
  enrollments,
  assessments,
  trainingSessions,
  modules,
  blogposts,
} from '@/lib/db/schema';

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const db = getDb();

    // Get basic stats
    const [
      totalUsers,
      totalCourses,
      totalCertificates,
      totalEnrollments,
      totalAssessments,
      totalTrainingSessions,
      totalModules,
      totalBlogs,
    ] = await Promise.all([
      db.select({ count: count() }).from(authUsers),
      db.select({ count: count() }).from(courses),
      db.select({ count: count() }).from(certificates),
      db.select({ count: count() }).from(enrollments),
      db.select({ count: count() }).from(assessments),
      db.select({ count: count() }).from(trainingSessions),
      db.select({ count: count() }).from(modules),
      db.select({ count: count() }).from(blogposts),
    ]);

    // Get enrollment trends (last 7 days)
    const enrollmentTrends = await db
      .select({
        date: sql<string>`DATE(${enrollments.createdAt})`,
        enrollments: count(),
      })
      .from(enrollments)
      .where(sql`${enrollments.createdAt} >= NOW() - INTERVAL '7 days'`)
      .groupBy(sql`DATE(${enrollments.createdAt})`)
      .orderBy(sql`DATE(${enrollments.createdAt})`);

    // Get certificate completion rates by course
    const certificateRates = await db
      .select({
        courseName: courses.title,
        totalEnrollments: count(enrollments.enrollmentId),
        totalCertificates: count(certificates.certificateId),
      })
      .from(courses)
      .leftJoin(enrollments, sql`${enrollments.courseId} = ${courses.courseId}`)
      .leftJoin(certificates, sql`${certificates.courseId} = ${courses.courseId}`)
      .groupBy(courses.courseId, courses.title)
      .limit(5);

    // Get recent training sessions
    const recentTrainingSessions = await db
      .select({
        sessionId: trainingSessions.sessionId,
        courseId: trainingSessions.courseId,
        startTime: trainingSessions.startTime,
        endTime: trainingSessions.endTime,
        maxParticipants: trainingSessions.maxParticipants,
      })
      .from(trainingSessions)
      .orderBy(desc(trainingSessions.startTime))
      .limit(5);

    type TrendRow = { date: string; enrollments: number };
    type RateRow = {
      courseName: string | null;
      totalEnrollments: number;
      totalCertificates: number;
    };
    type SessionRow = {
      sessionId: string;
      courseId: string;
      startTime: Date;
      endTime: Date;
      maxParticipants: number | null;
    };

    const analytics = {
      overview: {
        totalUsers: totalUsers[0]?.count || 0,
        totalCourses: totalCourses[0]?.count || 0,
        totalCertificates: totalCertificates[0]?.count || 0,
        totalEnrollments: totalEnrollments[0]?.count || 0,
        totalAssessments: totalAssessments[0]?.count || 0,
        totalTrainingSessions: totalTrainingSessions[0]?.count || 0,
        totalModules: totalModules[0]?.count || 0,
        totalBlogs: totalBlogs[0]?.count || 0,
      },
      enrollmentTrends: enrollmentTrends.map((item: TrendRow) => ({
        date: item.date,
        enrollments: Number(item.enrollments) || 0,
      })),
      certificateRates: certificateRates.map((item: RateRow) => ({
        courseName: item.courseName ?? '',
        completionRate:
          Number(item.totalEnrollments) > 0
            ? Math.round((Number(item.totalCertificates) / Number(item.totalEnrollments)) * 100)
            : 0,
        totalEnrollments: Number(item.totalEnrollments) || 0,
        totalCertificates: Number(item.totalCertificates) || 0,
      })),
      recentTrainingSessions: recentTrainingSessions.map((item: SessionRow) => ({
        sessionId: item.sessionId,
        courseId: item.courseId,
        startTime: item.startTime,
        endTime: item.endTime,
        maxParticipants: item.maxParticipants,
      })),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching learning analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

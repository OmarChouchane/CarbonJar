import { auth } from '@clerk/nextjs/server';
import { count, eq, inArray } from 'drizzle-orm';
import { GraduationCap, CalendarDays, Users } from 'lucide-react';
import Link from 'next/link';

import Button from '@/components/button';
import { H1, H2 } from '@/components/Heading';
import SectionWrapper from '@/components/section-wrapper';
import StatsCard from '@/components/stats-card';
import { getDb } from '@/lib/db/drizzle';
import { authUsers, enrollments, trainingSessions } from '@/lib/db/schema';

export default async function MentorHome() {
  const { userId: clerkId } = await auth();
  const db = getDb();

  // Get my internal userId
  const me = await db
    .select({ userId: authUsers.userId })
    .from(authUsers)
    .where(eq(authUsers.clerkId, clerkId ?? ''))
    .limit(1);
  const myId = me[0]?.userId;

  // Count my courses (mentor owns trainings by being instructor in sessions or by convention we show all for now)
  // Assumption: mentors manage any course where they are listed as instructor in a session.
  const mySessions = await db
    .select({ courseId: trainingSessions.courseId })
    .from(trainingSessions)
    .where(eq(trainingSessions.instructorId, myId));
  const myCourseIds = Array.from(new Set(mySessions.map((s) => s.courseId)));

  const trainingsCount = myCourseIds.length;

  const [sessionsCountRow] = await db
    .select({ c: count() })
    .from(trainingSessions)
    .where(eq(trainingSessions.instructorId, myId ?? ''));

  const enrollmentsRows = myCourseIds.length
    ? await db
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .where(inArray(enrollments.courseId, myCourseIds))
    : [];
  const enrollmentsCount = enrollmentsRows.length;

  return (
    <div className="mx-4 my-8 space-y-8 md:mx-12 lg:mx-32">
      {/* Hero */}
      <SectionWrapper variant="green" className="py-10">
        <div className="mx-auto max-w-3xl">
          <H1 className="text-white">Mentor Dashboard</H1>
          <H2 className="mt-3 text-white/90">
            Manage your trainings, sessions, and learners—all in one place.
          </H2>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/mentor/trainings">
              <Button
                primary
                className="cursor-pointer rounded-lg bg-green-700 px-6 py-3 font-semibold text-white shadow hover:bg-green-800"
              >
                Manage Trainings
              </Button>
            </Link>
            <Link href="/mentor/trainings/new">
              <Button
                secondary
                className="cursor-pointer rounded-lg border border-green-700 bg-white px-6 py-3 font-semibold text-green-700 shadow hover:bg-green-50"
              >
                Create Training
              </Button>
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <StatsCard
            title="My Trainings"
            value={trainingsCount}
            description="Courses you’re instructing"
            icon={GraduationCap}
          />
          <StatsCard
            title="Upcoming Sessions"
            value={sessionsCountRow.c}
            description="Scheduled sessions"
            icon={CalendarDays}
          />
          <StatsCard
            title="Total Enrollments"
            value={enrollmentsCount}
            description="Learners across your courses"
            icon={Users}
          />
        </div>
      </SectionWrapper>

      {/* Quick actions */}
      <SectionWrapper
        title="Quick Actions"
        subtitle="Jump into your most common tasks"
        className="bg-white"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href="/mentor/trainings" className="block">
            <div className="h-full rounded-xl border bg-gray-50 p-5 transition-shadow hover:shadow-lg">
              <div className="text-green mb-1 font-semibold">My Trainings</div>
              <div className="font-Inter text-sm text-gray-600">
                View and edit your courses and content modules.
              </div>
            </div>
          </Link>
          <Link href="/mentor/trainings/new" className="block">
            <div className="h-full rounded-xl border bg-gray-50 p-5 transition-shadow hover:shadow-lg">
              <div className="text-green mb-1 font-semibold">Create Training</div>
              <div className="font-Inter text-sm text-gray-600">
                Start a new course and publish when ready.
              </div>
            </div>
          </Link>
          <Link href="/trainings" className="block">
            <div className="h-full rounded-xl border bg-gray-50 p-5 transition-shadow hover:shadow-lg">
              <div className="text-green mb-1 font-semibold">Browse Catalog</div>
              <div className="font-Inter text-sm text-gray-600">
                Explore published trainings on CarbonJar.
              </div>
            </div>
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}

import { getDb } from "@/lib/db/drizzle";
import { courses, enrollments, trainingSessions } from "@/lib/db/schema";
import { count, eq, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { authUsers } from "@/lib/db/schema";
import { H1, H2 } from "@/components/Heading";
import SectionWrapper from "@/components/section-wrapper";
import StatsCard from "@/components/stats-card";
import Button from "@/components/button";
import { GraduationCap, CalendarDays, Users } from "lucide-react";

export default async function MentorHome() {
  const { userId: clerkId } = await auth();
  const db = getDb();

  // Get my internal userId
  const me = await db
    .select({ userId: authUsers.userId })
    .from(authUsers)
    .where(eq(authUsers.clerkId, clerkId!))
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
    .where(eq(trainingSessions.instructorId, myId!));

  const enrollmentsRows = myCourseIds.length
    ? await db
        .select({ courseId: enrollments.courseId })
        .from(enrollments)
        .where(inArray(enrollments.courseId, myCourseIds))
    : [];
  const enrollmentsCount = enrollmentsRows.length;

  return (
    <div className="lg:mx-32 md:mx-12 mx-4 my-8 space-y-8">
      {/* Hero */}
      <SectionWrapper variant="green" className="py-10">
        <div className="max-w-3xl mx-auto">
          <H1 className="text-white">Mentor Dashboard</H1>
          <H2 className="text-white/90 mt-3">
            Manage your trainings, sessions, and learners—all in one place.
          </H2>
          <div className="mt-6 flex items-center justify-center gap-3">
            <a href="/mentor/trainings">
              <Button
                primary
                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-lg shadow cursor-pointer"
              >
                Manage Trainings
              </Button>
            </a>
            <a href="/mentor/trainings/new">
              <Button
                secondary
                className="bg-white text-green-700 border border-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-lg shadow cursor-pointer"
              >
                Create Training
              </Button>
            </a>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/mentor/trainings" className="block">
            <div className="p-5 rounded-xl border hover:shadow-lg transition-shadow bg-gray-50 h-full">
              <div className="text-green font-semibold mb-1">My Trainings</div>
              <div className="text-gray-600 font-Inter text-sm">
                View and edit your courses and content modules.
              </div>
            </div>
          </a>
          <a href="/mentor/trainings/new" className="block">
            <div className="p-5 rounded-xl border hover:shadow-lg transition-shadow bg-gray-50 h-full">
              <div className="text-green font-semibold mb-1">
                Create Training
              </div>
              <div className="text-gray-600 font-Inter text-sm">
                Start a new course and publish when ready.
              </div>
            </div>
          </a>
          <a href="/trainings" className="block">
            <div className="p-5 rounded-xl border hover:shadow-lg transition-shadow bg-gray-50 h-full">
              <div className="text-green font-semibold mb-1">
                Browse Catalog
              </div>
              <div className="text-gray-600 font-Inter text-sm">
                Explore published trainings on CarbonJar.
              </div>
            </div>
          </a>
        </div>
      </SectionWrapper>
    </div>
  );
}

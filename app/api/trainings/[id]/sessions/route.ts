import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db/drizzle";
import { trainingSessions, courses, authUsers } from "@/lib/db/schema";

interface RouteParams {
  params: { id: string };
}

// Public endpoint: list sessions for a course by courseId
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const db = getDb();

    const sessions = await db
      .select({
        sessionId: trainingSessions.sessionId,
        courseId: trainingSessions.courseId,
        startTime: trainingSessions.startTime,
        endTime: trainingSessions.endTime,
        instructorId: trainingSessions.instructorId,
        maxParticipants: trainingSessions.maxParticipants,
        courseTitle: courses.title,
        instructorName: sql<string>`CONCAT(${authUsers.firstName}, ' ', ${authUsers.lastName})`,
      })
      .from(trainingSessions)
      .leftJoin(courses, eq(trainingSessions.courseId, courses.courseId))
      .leftJoin(authUsers, eq(trainingSessions.instructorId, authUsers.userId))
      .where(eq(trainingSessions.courseId, id));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions by courseId:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

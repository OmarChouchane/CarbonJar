import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db/drizzle";
import { trainingSessions, authUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const db = getDb();
    // DB role check
    const who = await db
      .select({ role: authUsers.role })
      .from(authUsers)
      .where(eq(authUsers.clerkId, userId))
      .limit(1);
    const role = who[0]?.role;
    if (role !== "trainer" && role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    const body = await request.json();

    const { courseId, startTime, endTime, instructorId, maxParticipants } =
      body;

    // Update training session
    const updatedSession = await db
      .update(trainingSessions)
      .set({
        courseId: courseId || undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        instructorId: instructorId || null,
        maxParticipants: maxParticipants || null,
        updatedAt: new Date(),
      })
      .where(eq(trainingSessions.sessionId, id))
      .returning();

    if (updatedSession.length === 0) {
      return new NextResponse("Training session not found", { status: 404 });
    }

    return NextResponse.json(updatedSession[0]);
  } catch (error) {
    console.error("Error updating training session:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const db = getDb();
    // DB role check
    const who = await db
      .select({ role: authUsers.role })
      .from(authUsers)
      .where(eq(authUsers.clerkId, userId))
      .limit(1);
    const role = who[0]?.role;
    if (role !== "trainer" && role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete training session
    const deletedSession = await db
      .delete(trainingSessions)
      .where(eq(trainingSessions.sessionId, id))
      .returning();

    if (deletedSession.length === 0) {
      return new NextResponse("Training session not found", { status: 404 });
    }

    return NextResponse.json({
      message: "Training session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting training session:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

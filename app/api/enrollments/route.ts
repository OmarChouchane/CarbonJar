import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

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
      .leftJoin(
        schema.authUsers,
        eq(schema.enrollments.userId, schema.authUsers.userId)
      )
      .leftJoin(
        schema.courses,
        eq(schema.enrollments.courseId, schema.courses.courseId)
      )
      .orderBy(desc(schema.enrollments.enrollmentDate));

    await client.end();

    // Filter results based on search and status
    const filteredEnrollments = enrollments.filter((enrollment) => {
      const fullName =
        `${enrollment.userName} ${enrollment.userLastName}`.toLowerCase();
      const courseTitle = enrollment.courseTitle?.toLowerCase() || "";
      const email = enrollment.userEmail?.toLowerCase() || "";

      const matchesSearch =
        search === "" ||
        fullName.includes(search.toLowerCase()) ||
        courseTitle.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase());

      const matchesStatus =
        status === "all" || enrollment.completionStatus === status;

      return matchesSearch && matchesStatus;
    });

    return NextResponse.json(filteredEnrollments);
  } catch (error) {
    console.error("Failed to fetch enrollments:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    const data = await req.json();

    // Prepare the enrollment data with proper timestamp handling
    const enrollmentData = {
      userId: data.userId,
      courseId: data.courseId,
      completionStatus: data.completionStatus || "in_progress",
      progressPercentage: data.progressPercentage || 0,
      // Let the database handle timestamp defaults, or convert string to Date if provided
      ...(data.enrollmentDate && {
        enrollmentDate: new Date(data.enrollmentDate),
      }),
    };

    await client.connect();
    const inserted = await db
      .insert(schema.enrollments)
      .values(enrollmentData)
      .returning();
    await client.end();

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error("Failed to create enrollment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

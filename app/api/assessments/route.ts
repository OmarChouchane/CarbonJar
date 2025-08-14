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

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    await client.connect();

    // Build the query with joins to get module and course information
    const assessments = await db
      .select({
        assessmentId: schema.assessments.assessmentId,
        moduleId: schema.assessments.moduleId,
        assessmentType: schema.assessments.assessmentType,
        maxScore: schema.assessments.maxScore,
        passingScore: schema.assessments.passingScore,
        timeLimit: schema.assessments.timeLimit,
        createdAt: schema.assessments.createdAt,
        updatedAt: schema.assessments.updatedAt,
        moduleTitle: schema.modules.title,
        courseTitle: schema.courses.title,
      })
      .from(schema.assessments)
      .leftJoin(
        schema.modules,
        eq(schema.assessments.moduleId, schema.modules.moduleId)
      )
      .leftJoin(
        schema.courses,
        eq(schema.modules.courseId, schema.courses.courseId)
      )
      .orderBy(desc(schema.assessments.createdAt));

    await client.end();

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Failed to fetch assessments:", error);
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

    // Prepare the assessment data
    const assessmentData = {
      moduleId: data.moduleId,
      assessmentType: data.assessmentType,
      maxScore: data.maxScore,
      passingScore: data.passingScore,
      timeLimit: data.timeLimit,
    };

    await client.connect();
    const inserted = await db
      .insert(schema.assessments)
      .values(assessmentData)
      .returning();
    await client.end();

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error("Failed to create assessment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

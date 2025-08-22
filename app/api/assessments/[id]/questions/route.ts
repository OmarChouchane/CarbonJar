import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../../../lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    await client.connect();
    const questions = await db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.assessmentId, id))
      .orderBy(asc(schema.questions.order));
    await client.end();

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    // Prepare question data
    const questionData = {
      assessmentId: id,
      text: data.text,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      order: data.order || 1,
    };

    await client.connect();
    const inserted = await db
      .insert(schema.questions)
      .values(questionData)
      .returning();
    await client.end();

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error("Failed to create question:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

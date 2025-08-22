import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    await client.connect();
    const assessment = await db
      .select()
      .from(schema.assessments)
      .where(eq(schema.assessments.assessmentId, id));
    await client.end();

    return NextResponse.json(assessment[0] || null);
  } catch (error) {
    console.error("Failed to fetch assessment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    await client.connect();
    const updated = await db
      .update(schema.assessments)
      .set({
        assessmentType: data.assessmentType,
        maxScore: data.maxScore,
        passingScore: data.passingScore,
        timeLimit: data.timeLimit,
        updatedAt: new Date(),
      })
      .where(eq(schema.assessments.assessmentId, id))
      .returning();
    await client.end();

    return NextResponse.json(updated[0] || null);
  } catch (error) {
    console.error("Failed to update assessment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });

    await client.connect();
    const deleted = await db
      .delete(schema.assessments)
      .where(eq(schema.assessments.assessmentId, id))
      .returning();
    await client.end();

    return NextResponse.json(deleted[0] || null);
  } catch (error) {
    console.error("Failed to delete assessment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

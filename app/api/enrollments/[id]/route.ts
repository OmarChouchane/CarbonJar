import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    const { id } = params;
    const data = await request.json();

    await client.connect();
    const updated = await db
      .update(schema.enrollments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.enrollments.enrollmentId, id))
      .returning();
    await client.end();

    return NextResponse.json(updated[0] || null);
  } catch (error) {
    console.error("Failed to update enrollment:", error);
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

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    const { id } = params;

    await client.connect();
    const deleted = await db
      .delete(schema.enrollments)
      .where(eq(schema.enrollments.enrollmentId, id))
      .returning();
    await client.end();

    return NextResponse.json({ success: true, deleted: deleted[0] });
  } catch (error) {
    console.error("Failed to delete enrollment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

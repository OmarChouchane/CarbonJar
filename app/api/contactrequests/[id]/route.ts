import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";

// Update a contact request by id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log("PUT request - ID:", id);
    console.log("PUT request - Body:", body);

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = drizzle(client, { schema });

    // Filter out undefined values and prepare update data
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.respondedAt !== undefined) {
      // Convert ISO string to Date object for timestamp fields
      updateData.respondedAt = new Date(body.respondedAt);
    }

    console.log("Update data:", updateData);

    const updated = await db
      .update(schema.contactrequests)
      .set(updateData)
      .where(eq(schema.contactrequests.id, id))
      .returning();

    await client.end();

    if (!updated[0]) {
      return new NextResponse("Not Found", { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (e) {
    console.error("Error updating contact request:", e);
    return new NextResponse(
      `Internal Server Error: ${
        e instanceof Error ? e.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}

// Delete a contact request by id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = drizzle(client, { schema });

    const deleted = await db
      .delete(schema.contactrequests)
      .where(eq(schema.contactrequests.id, id))
      .returning();

    await client.end();

    if (!deleted[0]) {
      return new NextResponse("Not Found", { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting contact request:", e);
    return new NextResponse(
      `Internal Server Error: ${
        e instanceof Error ? e.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}

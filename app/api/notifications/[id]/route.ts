import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import * as schema from "../../../../lib/db/schema";

// Admin-only GET by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = drizzle(client, { schema });

    const { id } = params;
    const notification = await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.id, id))
      .limit(1);

    await client.end();

    if (notification.length === 0) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    return NextResponse.json(notification[0]);
  } catch (error) {
    console.error("Error fetching notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Admin-only Update
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = drizzle(client, { schema });

    const { id } = params;
    const toUpdate: Partial<{
      content: string;
      status: "read" | "unread";
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };
    if (typeof data.content === "string") toUpdate.content = data.content;
    if (data.status === "read" || data.status === "unread") {
      toUpdate.status = data.status;
    }

    const updated = await db
      .update(schema.notifications)
      .set(toUpdate)
      .where(eq(schema.notifications.id, id))
      .returning();

    await client.end();

    if (updated.length === 0) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Admin-only Delete
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = drizzle(client, { schema });

    const { id } = params;
    await db
      .delete(schema.notifications)
      .where(eq(schema.notifications.id, id));

    await client.end();

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

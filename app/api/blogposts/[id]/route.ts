import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();
  try {
    const rows = await db
      .select()
      .from(schema.blogposts)
      .where(eq(schema.blogposts.id, params.id));
    return NextResponse.json(rows[0] ?? null);
  } catch (err: any) {
    return new NextResponse(err?.message || "Failed to fetch post", {
      status: 500,
    });
  } finally {
    await client.end();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();
  try {
    // Require auth (admin via middleware); ensure a user exists
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();

    // Fetch existing row to preserve authorId and decide publishDate
    const existingRows = await db
      .select()
      .from(schema.blogposts)
      .where(eq(schema.blogposts.id, params.id));
    const existing = existingRows[0];
    if (!existing) {
      return new NextResponse("Not found", { status: 404 });
    }

    const nextStatus: "draft" | "published" =
      data.status === "published" ? "published" : "draft";

    // publishDate logic:
    // - If moving to published and no existing publishDate, set now.
    // - If staying published, keep existing publishDate.
    // - If moving to draft, null publishDate.
    let nextPublishDate: Date | null = null;
    if (nextStatus === "published") {
      nextPublishDate = existing.publishDate
        ? new Date(existing.publishDate as any)
        : new Date();
    } else {
      nextPublishDate = null;
    }

    const updatePayload = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      status: nextStatus,
      publishDate: nextPublishDate,
      // Keep existing authorId
      authorId: (existing as any).authorId ?? null,
      updatedAt: new Date(),
    } as any;

    const updated = await db
      .update(schema.blogposts)
      .set(updatePayload)
      .where(eq(schema.blogposts.id, params.id))
      .returning();

    return NextResponse.json(updated[0] ?? null);
  } catch (err: any) {
    return new NextResponse(err?.message || "Failed to update post", {
      status: 500,
    });
  } finally {
    await client.end();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const deleted = await db
      .delete(schema.blogposts)
      .where(eq(schema.blogposts.id, params.id))
      .returning();
    return NextResponse.json(deleted[0] ?? null);
  } catch (err: any) {
    return new NextResponse(err?.message || "Failed to delete post", {
      status: 500,
    });
  } finally {
    await client.end();
  }
}

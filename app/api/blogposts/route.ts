import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../lib/db/schema";
import { auth } from "@clerk/nextjs/server";

export const GET = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();
  const blogposts = await db.select().from(schema.blogposts);
  await client.end();
  return NextResponse.json(blogposts);
};

export const POST = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });

  const data = await req.json();

  // Get current authenticated user (author)
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Normalize payload: ensure Date objects for timestamp columns
  const isPublished = data?.status === "published";
  const payload = {
    title: data?.title ?? "",
    slug: data?.slug ?? "",
    content: data?.content ?? null,
    status: isPublished ? ("published" as const) : ("draft" as const),
    publishDate: isPublished ? new Date() : null,
    authorId: userId,
    // createdAt/updatedAt have DB defaults; don't set them here
  };

  await client.connect();
  const inserted = await db
    .insert(schema.blogposts)
    .values(payload)
    .returning();
  await client.end();
  return NextResponse.json(inserted[0]);
};

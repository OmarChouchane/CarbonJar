import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const db = drizzle(client, { schema });
    const rows = await db
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.courseId, params.id))
      .limit(1);
    const row = rows[0];
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } finally {
    await client.end();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const db = drizzle(client, { schema });
    const body = await req.json();
    const update: Partial<typeof schema.courses.$inferInsert> = {};
    if (typeof body.title === "string") update.title = body.title;
    if (typeof body.description === "string" || body.description === null)
      update.description = body.description;
    if (typeof body.duration === "string" || body.duration === null)
      update.duration = body.duration;
    if (typeof body.price === "string" || body.price === null)
      update.price = body.price;
    if (typeof body.whyThisCourse === "string" || body.whyThisCourse === null)
      update.whyThisCourse = body.whyThisCourse;
    if (["beginner", "intermediate", "expert"].includes(body.level))
      update.level = body.level;
    if (["Draft", "Published", "Archived"].includes(body.status))
      update.status = body.status;
    if (typeof body.carbonAccountingFocus === "boolean")
      update.carbonAccountingFocus = body.carbonAccountingFocus;
    if (typeof body.carbonTopicId === "string" || body.carbonTopicId === null)
      update.carbonTopicId = body.carbonTopicId;
    update.lastUpdated = new Date();

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const rows = await db
      .update(schema.courses)
      .set(update)
      .where(eq(schema.courses.courseId, params.id))
      .returning();
    const row = rows[0];
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } finally {
    await client.end();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const db = drizzle(client, { schema });
    const rows = await db
      .delete(schema.courses)
      .where(eq(schema.courses.courseId, params.id))
      .returning();
    return NextResponse.json(rows[0] ?? null);
  } finally {
    await client.end();
  }
}

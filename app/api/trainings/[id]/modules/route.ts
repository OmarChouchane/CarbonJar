import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

type IncomingModule = {
  moduleId?: string;
  title: string;
  content: string;
  contentType: "Video" | "Text" | "Quiz";
  order: number;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();
  try {
    const list = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.courseId, id));
    return NextResponse.json(list);
  } catch (err: any) {
    return new NextResponse(err?.message || "Failed to fetch modules", {
      status: 500,
    });
  } finally {
    await client.end();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const courseId = id;
  if (!courseId) return new NextResponse("Missing courseId", { status: 400 });

  let body: { modules: IncomingModule[] } | null = null;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }
  const list = body?.modules ?? [];

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();

  try {
    // DB role check
    const me = await db
      .select({ role: schema.authUsers.role })
      .from(schema.authUsers)
      .where(eq(schema.authUsers.clerkId, clerkId))
      .limit(1);
    const role = me[0]?.role;
    if (role !== "trainer" && role !== "admin")
      return new NextResponse("Forbidden", { status: 403 });

    const exists = await db
      .select({ id: schema.courses.courseId })
      .from(schema.courses)
      .where(eq(schema.courses.courseId, courseId))
      .limit(1);
    if (!exists.length)
      return new NextResponse("Course not found", { status: 404 });

    const saved = await db.transaction(async (tx) => {
      await tx
        .delete(schema.modules)
        .where(eq(schema.modules.courseId, courseId));
      if (!list.length) return [] as any[];

      const rows = list.map((m, i) => ({
        courseId,
        title: (m.title || "").trim(),
        content: m.content || "",
        contentType: m.contentType,
        order: Number(m.order || i + 1),
      }));
      const inserted = await tx.insert(schema.modules).values(rows).returning();
      return inserted;
    });

    return NextResponse.json(saved);
  } catch (err: any) {
    return new NextResponse(err?.message || "Failed to save modules", {
      status: 500,
    });
  } finally {
    await client.end();
  }
}

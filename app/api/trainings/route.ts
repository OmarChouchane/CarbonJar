import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";

const getHandler = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  const trainings = await db.select().from(schema.courses);
  await client.end();
  return NextResponse.json(trainings);
};
export const GET = getHandler;

const postHandler = async (req: NextRequest) => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });

  // Fetch role from DB by clerkId
  const me = await db
    .select({ role: schema.authUsers.role, userId: schema.authUsers.userId })
    .from(schema.authUsers)
    .where(eq(schema.authUsers.clerkId, clerkId))
    .limit(1);
  const role = me[0]?.role;
  const meUserId = me[0]?.userId as string | undefined;
  if (role !== "trainer" && role !== "admin") {
    await client.end();
    return new NextResponse("Forbidden", { status: 403 });
  }

  const data = await req.json();
  // Whitelist fields aligned with schema
  // Determine status: trainers always create Draft; admins may set explicitly
  const requestedStatus = data?.status;
  const normalizedStatus =
    role === "admin" &&
    ["Draft", "Published", "Archived"].includes(requestedStatus)
      ? requestedStatus
      : "Draft";

  const values = {
    title: String(data.title || ""),
    description: data.description ?? null,
    level: data.level, // "beginner" | "intermediate" | "expert"
    status: normalizedStatus, // enforce Draft for mentors
    carbonTopicId: data.carbonTopicId ?? null,
    carbonAccountingFocus: Boolean(data.carbonAccountingFocus),
    duration: data.duration ?? null,
    price: data.price ?? null,
    whyThisCourse: data.whyThisCourse ?? null,
  } as const;

  const inserted = await db.insert(schema.courses).values(values).returning();

  // Ensure new course is visible under mentor's list by creating a default session
  try {
    if (meUserId) {
      const start = new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      await db
        .insert(schema.trainingSessions)
        .values({
          courseId: inserted[0].courseId,
          startTime: start,
          endTime: end,
          instructorId: meUserId,
          maxParticipants: null,
        })
        .returning();
    }
  } catch (e) {
    // non-fatal
    console.error("Failed to create default training session:", e);
  }

  await client.end();
  return NextResponse.json(inserted[0]);
};
export const POST = postHandler;

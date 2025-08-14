import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    await client.connect();

    // Build the query with joins to get course information
    const modules = await db
      .select({
        moduleId: schema.modules.moduleId,
        title: schema.modules.title,
        content: schema.modules.content,
        contentType: schema.modules.contentType,
        order: schema.modules.order,
        estimatedDuration: schema.modules.estimatedDuration,
        courseId: schema.modules.courseId,
        courseTitle: schema.courses.title,
        createdAt: schema.modules.createdAt,
        updatedAt: schema.modules.updatedAt,
      })
      .from(schema.modules)
      .leftJoin(
        schema.courses,
        eq(schema.modules.courseId, schema.courses.courseId)
      )
      .orderBy(schema.modules.order);

    await client.end();

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    const data = await req.json();

    await client.connect();
    const inserted = await db.insert(schema.modules).values(data).returning();
    await client.end();

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error("Failed to create module:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

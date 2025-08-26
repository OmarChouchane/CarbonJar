import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../lib/db/schema';

export const GET = async (_req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
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
      .leftJoin(schema.courses, eq(schema.modules.courseId, schema.courses.courseId))
      .orderBy(schema.modules.order);

    await client.end();

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Failed to fetch modules:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(client, { schema });
    const dataUnknown = (await req.json()) as unknown;
    type ModuleInsert = typeof schema.modules.$inferInsert;
    const data = dataUnknown as Partial<ModuleInsert>;
    const validTypes = schema.contentType.enumValues as readonly string[];
    const isContentType = (v: unknown): v is (typeof schema.contentType.enumValues)[number] =>
      typeof v === 'string' && validTypes.includes(v);
    const payload: ModuleInsert = {
      courseId: typeof data.courseId === 'string' ? data.courseId : '',
      title: typeof data.title === 'string' ? data.title : '',
      content: typeof data.content === 'string' ? data.content : null,
      contentType: isContentType(data.contentType) ? data.contentType : 'Text',
      order: typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : 1,
      estimatedDuration:
        typeof data.estimatedDuration === 'number' && Number.isFinite(data.estimatedDuration)
          ? data.estimatedDuration
          : null,
    };

    await client.connect();
    const inserted = await db.insert(schema.modules).values(payload).returning();
    await client.end();

    return NextResponse.json(inserted[0]);
  } catch (error) {
    console.error('Failed to create module:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

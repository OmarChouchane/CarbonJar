import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../lib/db/schema';

const getHandler = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });

  await client.connect();
  const prerequisites = await db.select().from(schema.coursePrerequisites);
  await client.end();
  return NextResponse.json(prerequisites);
};
export const GET = getHandler;

export async function POST(req: NextRequest) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });

  try {
    const bodyUnknown = (await req.json()) as unknown;
    const body = bodyUnknown as {
      courseId?: string;
      prerequisiteIds?: string[];
    };
    const { courseId, prerequisiteIds } = body;

    if (!courseId || !Array.isArray(prerequisiteIds)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Drizzle transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // 1. Delete existing prerequisites for this course
      await tx
        .delete(schema.coursePrerequisites)
        .where(eq(schema.coursePrerequisites.courseId, courseId));

      // 2. Insert new prerequisites if any are provided
      if (prerequisiteIds.length > 0) {
        const newPrereqs = prerequisiteIds.map((prereqId: string) => ({
          courseId,
          prerequisiteCourseId: prereqId,
        }));
        await tx.insert(schema.coursePrerequisites).values(newPrereqs);
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to update prerequisites:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.end();
  }
}

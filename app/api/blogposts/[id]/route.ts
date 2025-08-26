import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../../lib/db/schema';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();
  try {
    const rows = await db.select().from(schema.blogposts).where(eq(schema.blogposts.id, id));
    return NextResponse.json(rows[0] ?? null);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch post';
    return new NextResponse(message, {
      status: 500,
    });
  } finally {
    await client.end();
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();
  try {
    // Require auth (admin via middleware); ensure a user exists
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const dataUnknown = (await req.json()) as unknown;
    type BlogStatus = (typeof schema.blogStatus.enumValues)[number];
    type BlogpostRow = typeof schema.blogposts.$inferSelect;
    type BlogpostInsert = typeof schema.blogposts.$inferInsert;

    const data = dataUnknown as Partial<BlogpostInsert> & { status?: BlogStatus };

    // Fetch existing row to preserve authorId and decide publishDate
    const existingRows = await db
      .select()
      .from(schema.blogposts)
      .where(eq(schema.blogposts.id, id));
    const existing: BlogpostRow | undefined = existingRows[0];
    if (!existing) {
      return new NextResponse('Not found', { status: 404 });
    }

    const nextStatus: BlogStatus = data.status === 'published' ? 'published' : 'draft';

    // publishDate logic:
    // - If moving to published and no existing publishDate, set now.
    // - If staying published, keep existing publishDate.
    // - If moving to draft, null publishDate.
    let nextPublishDate: Date | null = null;
    if (nextStatus === 'published') {
      nextPublishDate = existing.publishDate ? new Date(existing.publishDate) : new Date();
    } else {
      nextPublishDate = null;
    }

    const updatePayload: Partial<BlogpostInsert> = {
      ...(typeof data.title === 'string' ? { title: data.title } : {}),
      ...(typeof data.slug === 'string' ? { slug: data.slug } : {}),
      ...(typeof data.content === 'string' ? { content: data.content } : {}),
      status: nextStatus,
      publishDate: nextPublishDate,
      // Keep existing authorId
      authorId: existing.authorId ?? null,
      updatedAt: new Date(),
    };

    const updated = await db
      .update(schema.blogposts)
      .set(updatePayload)
      .where(eq(schema.blogposts.id, id))
      .returning();

    return NextResponse.json(updated[0] ?? null);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update post';
    return new NextResponse(message, {
      status: 500,
    });
  } finally {
    await client.end();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  await client.connect();
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const deleted = await db
      .delete(schema.blogposts)
      .where(eq(schema.blogposts.id, id))
      .returning();
    return NextResponse.json(deleted[0] ?? null);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete post';
    return new NextResponse(message, {
      status: 500,
    });
  } finally {
    await client.end();
  }
}

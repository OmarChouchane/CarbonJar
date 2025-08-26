import { auth } from '@clerk/nextjs/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '../../../lib/db/schema';

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

  const dataUnknown = (await req.json()) as unknown;
  type BlogStatus = (typeof schema.blogStatus.enumValues)[number];
  type BlogInsert = typeof schema.blogposts.$inferInsert;
  const data = dataUnknown as Partial<BlogInsert> & { status?: BlogStatus };

  // Get current authenticated user (author)
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Normalize payload: ensure Date objects for timestamp columns
  const isPublished: boolean = data?.status === 'published';
  const payload: BlogInsert = {
    title: typeof data?.title === 'string' ? data.title : '',
    slug: typeof data?.slug === 'string' ? data.slug : '',
    content: typeof data?.content === 'string' ? data.content : null,
    status: isPublished ? 'published' : 'draft',
    publishDate: isPublished ? new Date() : null,
    authorId: userId,
  };

  await client.connect();
  const inserted = await db.insert(schema.blogposts).values(payload).returning();
  await client.end();
  return NextResponse.json(inserted[0]);
};

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

import * as schema from '@/lib/db/schema';

const getHandler = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });

  // Get the role query parameter
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  let users: Array<typeof schema.authUsers.$inferSelect>;
  const allowedRoles = ['user', 'admin', 'trainer', 'trainee'] as const;
  if (role && allowedRoles.includes(role as (typeof allowedRoles)[number])) {
    // Filter users by role if specified and valid
    users = await db
      .select()
      .from(schema.authUsers)
      .where(eq(schema.authUsers.role, role as (typeof allowedRoles)[number]));
  } else {
    // Return all users if no role filter is specified or invalid role
    users = await db.select().from(schema.authUsers);
  }

  await client.end();
  return NextResponse.json(users);
};
export const GET = getHandler;

const postHandler = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  try {
    const json = (await req.json()) as unknown;
    // Trusting API consumer to provide compatible fields; narrow type for Drizzle
    const data = json as typeof schema.authUsers.$inferInsert;
    const inserted = await db.insert(schema.authUsers).values(data).returning();
    return NextResponse.json(inserted[0] ?? null);
  } finally {
    await client.end();
  }
};
export const POST = postHandler;

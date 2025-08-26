import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { getDb } from '@/lib/db/drizzle';
import * as schema from '@/lib/db/schema';
import { rateLimit } from '@/lib/rateLimit';

// Ensure this route runs on the Node.js runtime (required for DB connections)
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();

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

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = getDb();
  try {
    await requireAuth({ roles: ['admin'] });

    // Rate limit per IP and user for POSTs
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const limit = await rateLimit(`users:POST:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      const res = NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      res.headers.set('Retry-After', String(Math.ceil((limit.reset - Date.now()) / 1000)));
      return res;
    }

    const json = (await req.json()) as unknown;
    // Trusting API consumer to provide compatible fields; narrow type for Drizzle
    const data = json as typeof schema.authUsers.$inferInsert;
    const inserted = await db.insert(schema.authUsers).values(data).returning();
    return NextResponse.json(inserted[0] ?? null);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

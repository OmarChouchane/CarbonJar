import { auth } from '@clerk/nextjs/server';
import { and, desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db/drizzle';
import { authUsers, notifications } from '@/lib/db/schema';

// Best-effort DB error classifier to avoid crashing the route on transient issues
function classifyDbError(err: unknown): 'timeout' | 'network' | 'other' {
  const obj = err as { message?: unknown; code?: unknown } | null | undefined;
  const fallback = typeof err === 'string' ? err : err instanceof Error ? err.message : '';
  const msg = (typeof obj?.message === 'string' ? obj.message : fallback).toLowerCase();
  const code = (typeof obj?.code === 'string' ? obj.code : '').toLowerCase();
  if (msg.includes('etimedout') || code === 'etimedout') return 'timeout';
  if (msg.includes('fetch failed') || msg.includes('network')) return 'network';
  return 'other';
}

function safeJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/user/notifications -> list current user's notifications
// PATCH /api/user/notifications -> mark all as read for current user
export async function GET(_req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse('Unauthorized', { status: 401 });

    try {
      const db = getDb();
      const user = await db
        .select({ userId: authUsers.userId })
        .from(authUsers)
        .where(eq(authUsers.clerkId, clerkId))
        .limit(1);

      if (user.length === 0) return new NextResponse('User not found', { status: 404 });

      const userId = user[0].userId;
      const items = await db
        .select()
        .from(notifications)
        .where(eq(notifications.recipientId, userId))
        .orderBy(desc(notifications.createdAt));

      const unreadCount = items.reduce((acc, n) => acc + (n.status === 'unread' ? 1 : 0), 0);

      return safeJson({ items, unreadCount });
    } catch (dbErr) {
      const kind = classifyDbError(dbErr);
      // Graceful degradation: return empty list on transient DB/network issues
      if (kind === 'timeout' || kind === 'network') {
        console.warn('[notifications] transient DB issue, returning empty set');
        return safeJson({ items: [], unreadCount: 0, degraded: true });
      }
      console.error('Error fetching user notifications:', dbErr);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching user notifications (auth):', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(_req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse('Unauthorized', { status: 401 });

    try {
      const db = getDb();
      const user = await db
        .select({ userId: authUsers.userId })
        .from(authUsers)
        .where(eq(authUsers.clerkId, clerkId))
        .limit(1);

      if (user.length === 0) return new NextResponse('User not found', { status: 404 });

      const userId = user[0].userId;

      await db
        .update(notifications)
        .set({ status: 'read', updatedAt: new Date() })
        .where(
          and(eq(notifications.recipientId, userId), eq(notifications.status, 'unread' as const)),
        );

      // Refetch summary
      const items = await db
        .select()
        .from(notifications)
        .where(eq(notifications.recipientId, userId))
        .orderBy(desc(notifications.createdAt));
      const unreadCount = items.reduce((acc, n) => acc + (n.status === 'unread' ? 1 : 0), 0);

      return safeJson({ success: true, unreadCount });
    } catch (dbErr) {
      const kind = classifyDbError(dbErr);
      if (kind === 'timeout' || kind === 'network') {
        console.warn('[notifications] transient DB issue while patch; responding degraded');
        return safeJson({ success: false, degraded: true }, 202);
      }
      console.error('Error marking all notifications read:', dbErr);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  } catch (error) {
    console.error('Error marking all notifications read (auth):', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db/drizzle";
import { authUsers, notifications } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";

// GET /api/user/notifications -> list current user's notifications
// PATCH /api/user/notifications -> mark all as read for current user
export async function GET(_req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const db = getDb();
    const user = await db
      .select({ userId: authUsers.userId })
      .from(authUsers)
      .where(eq(authUsers.clerkId, clerkId))
      .limit(1);

    if (user.length === 0)
      return new NextResponse("User not found", { status: 404 });

    const userId = user[0].userId;
    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, userId))
      .orderBy(desc(notifications.createdAt));

    const unreadCount = items.reduce(
      (acc, n) => acc + (n.status === "unread" ? 1 : 0),
      0
    );

    return NextResponse.json({ items, unreadCount });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(_req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const db = getDb();
    const user = await db
      .select({ userId: authUsers.userId })
      .from(authUsers)
      .where(eq(authUsers.clerkId, clerkId))
      .limit(1);

    if (user.length === 0)
      return new NextResponse("User not found", { status: 404 });

    const userId = user[0].userId;

    await db
      .update(notifications)
      .set({ status: "read", updatedAt: new Date() })
      .where(
        and(
          eq(notifications.recipientId, userId),
          eq(notifications.status, "unread" as const)
        )
      );

    // Refetch summary
    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientId, userId))
      .orderBy(desc(notifications.createdAt));
    const unreadCount = items.reduce(
      (acc, n) => acc + (n.status === "unread" ? 1 : 0),
      0
    );

    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

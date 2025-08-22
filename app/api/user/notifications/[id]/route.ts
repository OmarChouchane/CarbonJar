import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db/drizzle";
import { authUsers, notifications } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

// PATCH /api/user/notifications/[id] -> mark a single notification read/unread
// DELETE /api/user/notifications/[id] -> delete a notification (owner only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const status = body?.status as "read" | "unread" | undefined;

    const db = getDb();
    const user = await db
      .select({ userId: authUsers.userId })
      .from(authUsers)
      .where(eq(authUsers.clerkId, clerkId))
      .limit(1);

    if (user.length === 0)
      return new NextResponse("User not found", { status: 404 });

    const userId = user[0].userId;

    // Ensure ownership and update
    const updated = await db
      .update(notifications)
      .set({
        ...(status ? { status } : {}),
        updatedAt: new Date(),
      })
      .where(
        and(eq(notifications.id, id), eq(notifications.recipientId, userId))
      )
      .returning();

    if (updated.length === 0)
      return new NextResponse("Not found", { status: 404 });

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;
    const db = getDb();
    const user = await db
      .select({ userId: authUsers.userId })
      .from(authUsers)
      .where(eq(authUsers.clerkId, clerkId))
      .limit(1);

    if (user.length === 0)
      return new NextResponse("User not found", { status: 404 });

    const userId = user[0].userId;

    const res = await db
      .delete(notifications)
      .where(
        and(eq(notifications.id, id), eq(notifications.recipientId, userId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

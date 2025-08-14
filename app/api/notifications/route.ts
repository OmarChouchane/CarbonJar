import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import * as schema from "../../../lib/db/schema";

// Admin-only route to get all notifications
const getHandler = async (req: NextRequest) => {
  try {
    // Assuming Clerk middleware has already verified admin role
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = drizzle(client, { schema });

    // Fetch all notifications and join with user info for the admin panel
    const allNotifications = await db
      .select({
        id: schema.notifications.id,
        content: schema.notifications.content,
        status: schema.notifications.status,
        createdAt: schema.notifications.createdAt,
        recipientEmail: schema.authUsers.email,
        recipientId: schema.authUsers.userId,
      })
      .from(schema.notifications)
      .leftJoin(
        schema.authUsers,
        eq(schema.notifications.recipientId, schema.authUsers.userId)
      )
      .orderBy(desc(schema.notifications.createdAt));

    await client.end();
    return NextResponse.json(allNotifications);
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = getHandler;

// Admin-only route to create a notification for a specific user or group
const postHandler = async (req: NextRequest) => {
  try {
    const { userId: adminId } = await auth();
    if (!adminId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const { recipientId, content, targetGroup, targetCourseId } = data;

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = drizzle(client, { schema });

    if (targetGroup) {
      // Handle group notifications
      let targetUsers: { userId: string }[] = [];

      switch (targetGroup) {
        case "all":
          targetUsers = await db
            .select({ userId: schema.authUsers.userId })
            .from(schema.authUsers);
          break;
        case "admin":
        case "trainer":
        case "trainee":
          targetUsers = await db
            .select({ userId: schema.authUsers.userId })
            .from(schema.authUsers)
            .where(eq(schema.authUsers.role, targetGroup));
          break;
        case "course_enrolled":
          if (!targetCourseId) {
            return new NextResponse("Missing targetCourseId for this group", {
              status: 400,
            });
          }
          targetUsers = await db
            .select({ userId: schema.enrollments.userId })
            .from(schema.enrollments)
            .where(eq(schema.enrollments.courseId, targetCourseId));
          break;
        case "certificate_holder":
          if (!targetCourseId) {
            return new NextResponse("Missing targetCourseId for this group", {
              status: 400,
            });
          }
          targetUsers = await db
            .select({ userId: schema.certificates.userId })
            .from(schema.certificates)
            .where(eq(schema.certificates.courseId, targetCourseId));
          break;
        default:
          return new NextResponse("Invalid target group", { status: 400 });
      }

      if (targetUsers.length === 0) {
        await client.end();
        return new NextResponse("No users found in the target group", {
          status: 404,
        });
      }

      // Remove duplicates
      const uniqueUserIds = [...new Set(targetUsers.map((u) => u.userId))];

      const notificationsToInsert = uniqueUserIds.map((userId) => ({
        recipientId: userId,
        content,
        type: "user",
        status: "unread" as "read" | "unread",
      }));

      const inserted = await db
        .insert(schema.notifications)
        .values(notificationsToInsert)
        .returning();

      await client.end();
      return NextResponse.json({
        message: `Notification sent to ${inserted.length} users.`,
      });
    } else if (recipientId && content) {
      // Handle single-user notification
      const userExists = await db
        .select({ id: schema.authUsers.userId })
        .from(schema.authUsers)
        .where(eq(schema.authUsers.userId, recipientId))
        .limit(1);

      if (userExists.length === 0) {
        await client.end();
        return new NextResponse("Recipient user not found", { status: 404 });
      }

      const inserted = await db
        .insert(schema.notifications)
        .values({
          recipientId,
          content,
          type: "user",
          status: "unread",
        })
        .returning();

      await client.end();
      return NextResponse.json(inserted[0]);
    } else {
      await client.end();
      return new NextResponse("Missing recipientId/targetGroup or content", {
        status: 400,
      });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = postHandler;

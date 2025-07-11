import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

// Interface for Clerk user data
interface ClerkUser {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string;
  last_sign_in_at?: number;
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  console.log("🔔 Webhook received");

  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("❌ CLERK_WEBHOOK_SECRET not found");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get the headers
    const headerPayload = req.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error occured -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("❌ Webhook verification failed:", err);
      return new Response("Error occured", {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;

    try {
      const db = getDb();

      if (eventType === "user.created") {
        const user = evt.data as ClerkUser;
        const email = user.email_addresses?.[0]?.email_address;
        
        await db.insert(users).values({
          clerkId: user.id,
          email: email || "",
          firstName: user.first_name || null,
          lastName: user.last_name || null,
          username: user.username || null,
          profileImageUrl: user.image_url || null,
          lastSignInAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
        });

        console.log("✅ User created in database:", user.id);
      } 
      else if (eventType === "user.updated") {
        const user = evt.data as ClerkUser;
        const email = user.email_addresses?.[0]?.email_address;
        
        await db
          .update(users)
          .set({
            email: email || "",
            firstName: user.first_name || null,
            lastName: user.last_name || null,
            username: user.username || null,
            profileImageUrl: user.image_url || null,
            lastSignInAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, user.id));

        console.log("✅ User updated in database:", user.id);
      } 
      else if (eventType === "user.deleted") {
        const user = evt.data as ClerkUser;
        
        // Soft delete - mark as deleted instead of actually removing
        await db
          .update(users)
          .set({
            isDeleted: true,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, user.id));

        console.log("✅ User marked as deleted in database:", user.id);
      } 
      else {
        console.log("⚠️ Unhandled webhook event type:", eventType);
      }
    } catch (dbError) {
      console.error("❌ Database operation failed:", dbError);
      return new Response("Database error", { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook processing failed:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

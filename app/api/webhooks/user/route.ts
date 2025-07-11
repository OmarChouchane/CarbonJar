import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

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

    if (eventType === "user.created") {
      const user = evt.data;
      const email = user.email_addresses?.[0]?.email_address;

      try {
        const db = getDb();
        await db.insert(users).values({
          clerkId: user.id,
          email,
        });

        console.log("✅ User created in database:", user.id);
      } catch (dbError) {
        console.error("❌ Database insertion failed:", dbError);
        return new Response("Database error", { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook processing failed:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db/drizzle";
import { certificates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Authenticate the user
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get database connection
    const db = getDb();

    // Fetch certificates for the current user
    const userCertificates = await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(certificates.issuedAt);

    return NextResponse.json({
      success: true,
      data: userCertificates,
      count: userCertificates.length,
    });
  } catch (error) {
    console.error("❌ Failed to fetch certificates:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

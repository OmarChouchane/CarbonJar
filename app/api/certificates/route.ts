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

export async function POST() {
  try {
    // Authenticate the user
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get database connection
    const db = getDb();

    // Sample test certificates data
    const testCertificates = [
      {
        userId,
        title: "Carbon Management Fundamentals",
        description:
          "Complete understanding of carbon footprint measurement and management strategies for businesses.",
        certificateUrl:
          "https://example.com/certificates/carbon-fundamentals.pdf",
        issuedAt: new Date("2024-01-15"),
      },
      {
        userId,
        title: "Sustainable Business Practices",
        description:
          "Advanced certification in implementing sustainable practices across business operations.",
        certificateUrl:
          "https://example.com/certificates/sustainable-business.pdf",
        issuedAt: new Date("2024-02-20"),
      },
      {
        userId,
        title: "Climate Action Leadership",
        description:
          "Leadership certification for driving climate action initiatives in organizations.",
        certificateUrl:
          "https://example.com/certificates/climate-leadership.pdf",
        issuedAt: new Date("2024-03-10"),
      },
      {
        userId,
        title: "Green Energy Transition",
        description:
          "Expertise in renewable energy adoption and transition strategies for enterprises.",
        certificateUrl: "https://example.com/certificates/green-energy.pdf",
        issuedAt: new Date("2024-04-05"),
      },
      {
        userId,
        title: "Environmental Impact Assessment",
        description:
          "Professional certification in conducting comprehensive environmental impact assessments.",
        certificateUrl:
          "https://example.com/certificates/impact-assessment.pdf",
        issuedAt: new Date("2024-05-12"),
      },
    ];

    // Insert test certificates
    const insertedCertificates = await db
      .insert(certificates)
      .values(testCertificates)
      .returning();

    return NextResponse.json({
      success: true,
      message: "Test certificates created successfully",
      data: insertedCertificates,
      count: insertedCertificates.length,
    });
  } catch (error) {
    console.error("❌ Failed to create test certificates:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

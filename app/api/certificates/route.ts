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
      .orderBy(certificates.issueDate);

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
        courseId: "550e8400-e29b-41d4-a716-446655440000", // Sample course ID
        fullName: "John Doe",
        title: "Carbon Management Fundamentals",
        description:
          "Complete understanding of carbon footprint measurement and management strategies for businesses.",
        courseStartDate: "2024-01-01",
        courseEndDate: "2024-01-14",
        issueDate: new Date("2024-01-15"),
        validUntil: new Date("2026-01-15"),
        certificateCode: "0001",
        certificateSlug: "john-doe-carbon-fundamentals",
        pdfUrl: "https://example.com/certificates/carbon-fundamentals.pdf",
        certificateHash: "hash1234567890abcdef",
      },
      {
        userId,
        courseId: "550e8400-e29b-41d4-a716-446655440001",
        fullName: "John Doe",
        title: "Sustainable Business Practices",
        description:
          "Advanced certification in implementing sustainable practices across business operations.",
        courseStartDate: "2024-02-01",
        courseEndDate: "2024-02-19",
        issueDate: new Date("2024-02-20"),
        validUntil: new Date("2026-02-20"),
        certificateCode: "0002",
        certificateSlug: "john-doe-sustainable-business",
        pdfUrl: "https://example.com/certificates/sustainable-business.pdf",
        certificateHash: "hash2234567890abcdef",
      },
      {
        userId,
        courseId: "550e8400-e29b-41d4-a716-446655440002",
        fullName: "John Doe",
        title: "Climate Action Leadership",
        description:
          "Leadership certification for driving climate action initiatives in organizations.",
        courseStartDate: "2024-03-01",
        courseEndDate: "2024-03-09",
        issueDate: new Date("2024-03-10"),
        validUntil: new Date("2026-03-10"),
        certificateCode: "0003",
        certificateSlug: "john-doe-climate-leadership",
        pdfUrl: "https://example.com/certificates/climate-leadership.pdf",
        certificateHash: "hash3234567890abcdef",
      },
      {
        userId,
        courseId: "550e8400-e29b-41d4-a716-446655440003",
        fullName: "John Doe",
        title: "Green Energy Transition",
        description:
          "Expertise in renewable energy adoption and transition strategies for enterprises.",
        courseStartDate: "2024-04-01",
        courseEndDate: "2024-04-04",
        issueDate: new Date("2024-04-05"),
        validUntil: new Date("2026-04-05"),
        certificateCode: "0004",
        certificateSlug: "john-doe-green-energy",
        pdfUrl: "https://example.com/certificates/green-energy.pdf",
        certificateHash: "hash4234567890abcdef",
      },
      {
        userId,
        courseId: "550e8400-e29b-41d4-a716-446655440004",
        fullName: "John Doe",
        title: "Environmental Impact Assessment",
        description:
          "Professional certification in conducting comprehensive environmental impact assessments.",
        courseStartDate: "2024-05-01",
        courseEndDate: "2024-05-11",
        issueDate: new Date("2024-05-12"),
        validUntil: new Date("2026-05-12"),
        certificateCode: "0005",
        certificateSlug: "john-doe-impact-assessment",
        pdfUrl: "https://example.com/certificates/impact-assessment.pdf",
        certificateHash: "hash5234567890abcdef",
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

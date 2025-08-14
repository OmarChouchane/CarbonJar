import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { randomUUID } from "crypto";

import * as schema from "@/lib/db/schema";

export const GET = async () => {
const client = new Client({ connectionString: process.env.DATABASE_URL });
const db = drizzle(client, { schema });
  await client.connect();
  const certificates = await db.select().from(schema.certificates);
  await client.end();
  return NextResponse.json(certificates);
};


export const POST = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(client, { schema });
  const data = await req.json();
  const certificateCode = Math.floor(1000 + Math.random() * 9000).toString(); // Example: 4-digit code
  const certificateSlug = `${data.fullName
    .replace(/\s+/g, "-")
    .toLowerCase()}-${data.title.replace(/\s+/g, "-").toLowerCase()}`;
  const certificateHash = randomUUID();

  // Normalize date fields
  const normalized = {
    ...data,
    courseStartDate: toPlainDate(data.courseStartDate), // YYYY-MM-DD
    courseEndDate: toPlainDate(data.courseEndDate), // YYYY-MM-DD
    issueDate: normalizeDateField(data.issueDate), // ISO string
    validUntil: normalizeDateField(data.validUntil), // ISO string
    certificateCode,
    certificateSlug,
    certificateHash,
    issuerName: "Oussama Ben Abdessalem",
    issuerRole: "CEO of Carbon Jar",
  };
  /*console.log("Incoming data:", data);
  console.log("Normalized data:", normalized);*/
  await client.connect();
  console.log(
    "Normalized data types:",
    Object.entries(normalized).map(([k, v]) => [k, typeof v, v])
  );

  try {
    const inserted = await db
      .insert(schema.certificates)
      .values(normalized)
      .returning();
    await client.end();
    return NextResponse.json(inserted[0]);
  } catch (err) {
    console.error("Insert error:", err);
    await client.end();
    const errorMessage =
      typeof err === "object" && err !== null && "message" in err
        ? (err as { message: string }).message
        : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};

function toPlainDate(value: any): string | null {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return null;

  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function normalizeDateField(value: any): Date | null {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return null;

  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return null;

  return date; // Return Date object for Drizzle/Postgres
}

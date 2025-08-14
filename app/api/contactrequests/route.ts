import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { desc } from "drizzle-orm";
import * as schema from "../../../lib/db/schema";

// GET /api/contactrequests -> return all requests ordered by submittedAt desc
export const GET = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  try {
    const requests = await db
      .select()
      .from(schema.contactrequests)
      .orderBy(desc(schema.contactrequests.submittedAt));
    return NextResponse.json(requests);
  } catch (e) {
    console.error("Error fetching contact requests:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await client.end();
  }
};

// POST /api/contactrequests -> create a new contact request
export const POST = async (req: NextRequest) => {
  const data = await req.json();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  try {
    const inserted = await db
      .insert(schema.contactrequests)
      .values(data)
      .returning();
    return NextResponse.json(inserted[0]);
  } catch (e) {
    console.error("Error creating contact request:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await client.end();
  }
};

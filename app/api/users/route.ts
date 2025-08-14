import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";

const getHandler = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });

  // Get the role query parameter
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  let users;
  const allowedRoles = ["user", "admin", "trainer", "trainee"] as const;
  if (role && allowedRoles.includes(role as typeof allowedRoles[number])) {
    // Filter users by role if specified and valid
    users = await db
      .select()
      .from(schema.authUsers)
      .where(eq(schema.authUsers.role, role as typeof allowedRoles[number]));
  } else {
    // Return all users if no role filter is specified or invalid role
    users = await db.select().from(schema.authUsers);
  }

  await client.end();
  return NextResponse.json(users);
};
export const GET = getHandler;

const postHandler = async (req: NextRequest) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client, { schema });
  const data = await req.json();
  const inserted = await db.insert(schema.authUsers).values(data).returning();
  await client.end();
  return NextResponse.json(inserted[0]);
};
export const POST = postHandler;

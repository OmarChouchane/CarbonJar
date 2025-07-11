// app/api/test-user/route.ts
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const allUsers = await db.select().from(users);
  return NextResponse.json(allUsers);
}

// lib/db/drizzle.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Lazy database connection to avoid build-time errors
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
  }
  return db;
}

// Export for backward compatibility
export { getDb as db };

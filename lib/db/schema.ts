// src/lib/db/schema/index.ts
import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

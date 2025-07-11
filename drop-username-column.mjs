import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function dropUsernameColumn() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log("🔄 Dropping username column from users table...");

    // Check if column exists first
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'username';
    `;

    if (columnExists.length > 0) {
      // Drop the username column
      await sql`ALTER TABLE "users" DROP COLUMN "username";`;
      console.log("✅ Username column dropped successfully!");
    } else {
      console.log("ℹ️ Username column does not exist, nothing to drop.");
    }

    // Verify the current table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;

    console.log("\n📋 Current users table structure:");
    columns.forEach((col) => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

dropUsernameColumn();

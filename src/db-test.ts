import { sql } from "./db";

async function testDb() {
  try {
    const result = await sql`SELECT 1 as ok`;
    console.log("DB connection OK:", result);
  } catch (err) {
    console.error("DB connection FAILED:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testDb();

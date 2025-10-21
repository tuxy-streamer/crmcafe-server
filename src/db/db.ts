import postgres from "postgres";

export const sql = postgres(process.env.DATABASE_URL!, {
  prepare: true,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
});

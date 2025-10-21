import { type FastifyInstance } from "fastify";
import { sql } from "../db";

export async function registerCustomerTagRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get(
    "/customer-tags",
    async () =>
      await sql`SELECT * FROM customer_tags ORDER BY customer_id, tag_id`,
  );

  app.post("/customer-tags", async (req) => {
    const b = req.body as { customer_id: number; tag_id: number };
    const rows = await sql`
      INSERT INTO customer_tags (customer_id, tag_id)
      VALUES (${b.customer_id}, ${b.tag_id})
      ON CONFLICT (customer_id, tag_id) DO NOTHING
      RETURNING *`;
    return rows[0] ?? { inserted: false };
  });

  app.delete("/customer-tags", async (req) => {
    const b = req.body as { customer_id: number; tag_id: number };
    const rows =
      await sql`DELETE FROM customer_tags WHERE customer_id=${b.customer_id} AND tag_id=${b.tag_id} RETURNING *`;
    return { deleted: rows.length > 0 };
  });
}

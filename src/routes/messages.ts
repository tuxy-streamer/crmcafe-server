import { type FastifyInstance } from "fastify";
import { sql } from "../db";
import { buildUpdateSet, buildPagination, buildFilters } from "../util/sql";

export async function registerMessageRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/messages", async (req) => {
    const query = req.query as any;
    const { limit, offset } = buildPagination({
      page: query.page,
      limit: query.limit,
    });
    const { whereClause, values } = buildFilters(query);

    const countResult = await sql.unsafe(
      `SELECT COUNT(*) as total FROM messages ${whereClause}`,
      values,
    );
    const total = Number(countResult[0]?.total || 0);

    const rows = await sql.unsafe(
      `SELECT * FROM messages ${whereClause} ORDER BY message_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset],
    );

    return {
      data: rows,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

  app.get("/messages/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`SELECT * FROM messages WHERE message_id = ${id}`;
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.post("/messages", async (req) => {
    const b = req.body as Partial<{
      customer_id: number;
      user_id: number | null;
      channel: string;
      message_body: string;
      status: string | null;
      timestamp: string | null;
    }>;
    const rows = await sql`
      INSERT INTO messages (customer_id, user_id, channel, message_body, status, "timestamp")
      VALUES (${b?.customer_id ?? null}, ${b?.user_id ?? null}, ${b?.channel ?? null}, ${b?.message_body ?? null}, ${b?.status ?? "sent"}, ${b?.timestamp ?? null})
      RETURNING *`;
    return rows[0];
  });

  app.patch("/messages/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const data = req.body as Record<string, unknown>;
    const { setClause, values } = buildUpdateSet(data);
    if (!setClause) return reply.code(400).send({ error: "No fields" });
    const rows = await sql.unsafe(
      `UPDATE messages SET ${setClause} WHERE message_id = $${values.length + 1} RETURNING *`,
      [...(values as any[]), id],
    );
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.delete("/messages/:id", async (req) => {
    const id = Number((req.params as { id: string }).id);
    const rows =
      await sql`DELETE FROM messages WHERE message_id = ${id} RETURNING *`;
    return { deleted: rows.length > 0 };
  });
}

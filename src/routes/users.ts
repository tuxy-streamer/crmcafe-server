import { type FastifyInstance } from "fastify";
import { sql } from "../db";
import { buildUpdateSet, buildPagination, buildFilters } from "../util/sql";

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get("/users", async (req) => {
    const query = req.query as any;
    const { limit, offset } = buildPagination({ page: query.page, limit: query.limit });
    const { whereClause, values } = buildFilters(query);
    
    const countResult = await sql.unsafe(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      values
    );
    const total = Number(countResult[0]?.total || 0);
    
    const rows = await sql.unsafe(
      `SELECT * FROM users ${whereClause} ORDER BY user_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );
    
    return {
      data: rows,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  app.get("/users/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`SELECT * FROM users WHERE user_id = ${id}`;
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.post("/users", async (req) => {
    const body = req.body as Partial<{
      name: string; email: string; password_hash: string; role: string;
    }>;
    const rows = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${body?.name ?? null}, ${body?.email ?? null}, ${body?.password_hash ?? null}, ${body?.role ?? 'agent'})
      RETURNING *`;
    return rows[0];
  });

  app.patch("/users/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const data = req.body as Record<string, unknown>;
    const { setClause, values } = buildUpdateSet(data);
    if (!setClause) return reply.code(400).send({ error: "No fields" });
    const rows = await sql.unsafe(
      `UPDATE users SET ${setClause} WHERE user_id = $${values.length + 1} RETURNING *`,
      [...(values as any[]), id],
    );
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.delete("/users/:id", async (req) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`DELETE FROM users WHERE user_id = ${id} RETURNING *`;
    return { deleted: rows.length > 0 };
  });
}



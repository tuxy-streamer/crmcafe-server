import { type FastifyInstance } from "fastify";
import { sql } from "../db";
import { buildUpdateSet, buildPagination, buildFilters } from "../util/sql";

export async function registerTagRoutes(app: FastifyInstance): Promise<void> {
  app.get("/tags", async (req) => {
    const query = req.query as any;
    const { limit, offset } = buildPagination({ page: query.page, limit: query.limit });
    const { whereClause, values } = buildFilters(query);
    
    const countResult = await sql.unsafe(
      `SELECT COUNT(*) as total FROM tags ${whereClause}`,
      values
    );
    const total = Number(countResult[0]?.total || 0);
    
    const rows = await sql.unsafe(
      `SELECT * FROM tags ${whereClause} ORDER BY tag_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
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

  app.get("/tags/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`SELECT * FROM tags WHERE tag_id = ${id}`;
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.post("/tags", async (req) => {
    const b = req.body as { name: string };
    const rows = await sql`INSERT INTO tags (name) VALUES (${b.name}) RETURNING *`;
    return rows[0];
  });

  app.patch("/tags/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const data = req.body as Record<string, unknown>;
    const { setClause, values } = buildUpdateSet(data);
    if (!setClause) return reply.code(400).send({ error: "No fields" });
    const rows = await sql.unsafe(
      `UPDATE tags SET ${setClause} WHERE tag_id = $${values.length + 1} RETURNING *`,
      [...(values as any[]), id],
    );
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.delete("/tags/:id", async (req) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`DELETE FROM tags WHERE tag_id = ${id} RETURNING *`;
    return { deleted: rows.length > 0 };
  });
}



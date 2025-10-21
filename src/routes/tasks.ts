import { type FastifyInstance } from "fastify";
import { sql } from "../db";
import { buildUpdateSet, buildPagination, buildFilters } from "../util/sql";

export async function registerTaskRoutes(app: FastifyInstance): Promise<void> {
  app.get("/tasks", async (req) => {
    const query = req.query as any;
    const { limit, offset } = buildPagination({
      page: query.page,
      limit: query.limit,
    });
    const { whereClause, values } = buildFilters(query);

    const countResult = await sql.unsafe(
      `SELECT COUNT(*) as total FROM tasks ${whereClause}`,
      values,
    );
    const total = Number(countResult[0]?.total || 0);

    const rows = await sql.unsafe(
      `SELECT * FROM tasks ${whereClause} ORDER BY task_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
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

  app.get("/tasks/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`SELECT * FROM tasks WHERE task_id = ${id}`;
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.post("/tasks", async (req) => {
    const b = req.body as Partial<{
      customer_id: number;
      assigned_to: number | null;
      task_description: string;
      due_date: string | null;
      status: string | null;
    }>;
    const rows = await sql`
      INSERT INTO tasks (customer_id, assigned_to, task_description, due_date, status)
      VALUES (${b?.customer_id ?? null}, ${b?.assigned_to ?? null}, ${b?.task_description ?? null}, ${b?.due_date ?? null}, ${b?.status ?? "pending"})
      RETURNING *`;
    return rows[0];
  });

  app.patch("/tasks/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const data = req.body as Record<string, unknown>;
    const { setClause, values } = buildUpdateSet(data);
    if (!setClause) return reply.code(400).send({ error: "No fields" });
    const rows = await sql.unsafe(
      `UPDATE tasks SET ${setClause} WHERE task_id = $${values.length + 1} RETURNING *`,
      [...(values as any[]), id],
    );
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.delete("/tasks/:id", async (req) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`DELETE FROM tasks WHERE task_id = ${id} RETURNING *`;
    return { deleted: rows.length > 0 };
  });
}

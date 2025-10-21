import { type FastifyInstance } from "fastify";
import { sql } from "../db";
import { buildUpdateSet, buildPagination, buildFilters } from "../util/sql";

export async function registerCustomerRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/customers", async (req) => {
    const query = req.query as any;
    const { limit, offset } = buildPagination({
      page: query.page,
      limit: query.limit,
    });
    const { whereClause, values } = buildFilters(query);

    const countResult = await sql.unsafe(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      values,
    );
    const total = Number(countResult[0]?.total || 0);

    const rows = await sql.unsafe(
      `SELECT * FROM customers ${whereClause} ORDER BY customer_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
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

  app.get("/customers/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`SELECT * FROM customers WHERE customer_id = ${id}`;
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.post("/customers", async (req) => {
    const b = req.body as Partial<{
      assigned_user_id: number;
      name: string;
      email: string | null;
      phone_number: string | null;
      company_name: string | null;
      address: string | null;
    }>;
    const rows = await sql`
      INSERT INTO customers (assigned_user_id, name, email, phone_number, company_name, address)
      VALUES (${b?.assigned_user_id ?? null}, ${b?.name ?? null}, ${b?.email ?? null}, ${b?.phone_number ?? null}, ${b?.company_name ?? null}, ${b?.address ?? null})
      RETURNING *`;
    return rows[0];
  });

  app.patch("/customers/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const data = req.body as Record<string, unknown>;
    const { setClause, values } = buildUpdateSet(data);
    if (!setClause) return reply.code(400).send({ error: "No fields" });
    const rows = await sql.unsafe(
      `UPDATE customers SET ${setClause} WHERE customer_id = $${values.length + 1} RETURNING *`,
      [...(values as any[]), id],
    );
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.delete("/customers/:id", async (req) => {
    const id = Number((req.params as { id: string }).id);
    const rows =
      await sql`DELETE FROM customers WHERE customer_id = ${id} RETURNING *`;
    return { deleted: rows.length > 0 };
  });
}

import { type FastifyInstance } from "fastify";
import { sql } from "../db";
import { buildUpdateSet, buildPagination, buildFilters } from "../util/sql";

export async function registerCallRoutes(app: FastifyInstance): Promise<void> {
  app.get("/calls", async (req) => {
    const query = req.query as any;
    const { limit, offset } = buildPagination({ page: query.page, limit: query.limit });
    const { whereClause, values } = buildFilters(query);
    
    const countResult = await sql.unsafe(
      `SELECT COUNT(*) as total FROM calls ${whereClause}`,
      values
    );
    const total = Number(countResult[0]?.total || 0);
    
    const rows = await sql.unsafe(
      `SELECT * FROM calls ${whereClause} ORDER BY call_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
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

  app.get("/calls/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`SELECT * FROM calls WHERE call_id = ${id}`;
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.post("/calls", async (req) => {
    const b = req.body as Partial<{
      customer_id: number; user_id: number | null; call_time: string; call_duration_seconds: number | null; call_recording_path: string | null; transcription_text: string | null; summary_text: string | null; sentiment: string | null; embedding_vector: unknown | null; model_used: string | null;
    }>;
    const rows = await sql`
      INSERT INTO calls (customer_id, user_id, call_time, call_duration_seconds, call_recording_path, transcription_text, summary_text, sentiment, embedding_vector, model_used)
      VALUES (
        ${b?.customer_id ?? null},
        ${b?.user_id ?? null},
        ${b?.call_time ?? null},
        ${b?.call_duration_seconds ?? null},
        ${b?.call_recording_path ?? null},
        ${b?.transcription_text ?? null},
        ${b?.summary_text ?? null},
        ${b?.sentiment ?? null},
        ${b?.embedding_vector != null ? sql.json(b.embedding_vector as any) : null},
        ${b?.model_used ?? null}
      )
      RETURNING *`;
    return rows[0];
  });

  app.patch("/calls/:id", async (req, reply) => {
    const id = Number((req.params as { id: string }).id);
    const data = req.body as Record<string, unknown>;
    const { setClause, values } = buildUpdateSet(data);
    if (!setClause) return reply.code(400).send({ error: "No fields" });
    const rows = await sql.unsafe(
      `UPDATE calls SET ${setClause} WHERE call_id = $${values.length + 1} RETURNING *`,
      [...(values as any[]), id],
    );
    if (!rows.length) return reply.code(404).send({ error: "Not found" });
    return rows[0];
  });

  app.delete("/calls/:id", async (req) => {
    const id = Number((req.params as { id: string }).id);
    const rows = await sql`DELETE FROM calls WHERE call_id = ${id} RETURNING *`;
    return { deleted: rows.length > 0 };
  });
}



export type UpdateSet = { setClause: string; values: any[] };
export type PaginationOptions = { page?: number; limit?: number; offset?: number };
export type FilterOptions = Record<string, unknown>;

export function buildUpdateSet(data: Record<string, unknown>): UpdateSet {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  const columns = entries.map(([k]) => k);
  const values = entries.map(([, v]) => v) as any[];
  const setClause = columns.map((c, i) => `${c} = $${i + 1}`).join(", ");
  return { setClause, values };
}

export function buildPagination(pagination: PaginationOptions = {}): { limit: number; offset: number } {
  const { page = 1, limit = 20, offset } = pagination;
  const finalLimit = Math.min(Math.max(1, limit), 100); // Cap at 100
  const finalOffset = offset ?? (page - 1) * finalLimit;
  return { limit: finalLimit, offset: Math.max(0, finalOffset) };
}

export function buildFilters(filters: FilterOptions = {}): { whereClause: string; values: any[] } {
  const entries = Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return { whereClause: '', values: [] };
  
  const conditions = entries.map(([key, value], i) => {
    if (typeof value === 'string' && value.includes('*')) {
      // Wildcard search
      const pattern = value.replace(/\*/g, '%');
      return `${key} ILIKE $${i + 1}`;
    } else if (Array.isArray(value)) {
      // IN clause
      const placeholders = value.map((_, j) => `$${i * 100 + j + 1}`).join(', ');
      return `${key} IN (${placeholders})`;
    } else {
      // Exact match
      return `${key} = $${i + 1}`;
    }
  });
  
  const values = entries.flatMap(([, value]) => Array.isArray(value) ? value : [value]);
  return { whereClause: `WHERE ${conditions.join(' AND ')}`, values };
}



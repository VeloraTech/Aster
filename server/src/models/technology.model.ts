import type { Pool, QueryResultRow } from 'pg'
import type {
  RelationshipType,
  Technology,
  TechnologyCategory,
  TechnologyCollection,
  TechnologyListQuery,
  TechnologyRepository,
  TechnologyRelationships,
  TechnologyResource,
  TechnologySummary,
} from '../types/technology.js'

type TechnologyRow = QueryResultRow & {
  id: string
  name: string
  slug: string
  description: string
  type: Technology['type']
  category: TechnologyCategory
  ecosystem: string | null
  logo: string | null
  context: string | null
}

type SummaryRow = Omit<TechnologyRow, 'context'>

type QueryPage = {
  whereSql: string
  values: unknown[]
  limit: number
  offset: number
  orderSql: 'ASC' | 'DESC'
}

export function buildTechnologyListQuery(query: TechnologyListQuery): QueryPage {
  const values: unknown[] = []
  const clauses: string[] = []
  const addFilter = (sql: string, value: unknown) => {
    values.push(value)
    clauses.push(sql.replace('?', `$${values.length}`))
  }

  if (query.search) {
    values.push(query.search.toLocaleLowerCase())
    const parameter = `$${values.length}`
    clauses.push(`(
      position(${parameter} in lower(name)) > 0 OR
      position(${parameter} in lower(description)) > 0 OR
      position(${parameter} in lower(type)) > 0 OR
      position(${parameter} in lower(category)) > 0 OR
      position(${parameter} in lower(coalesce(ecosystem, ''))) > 0
    )`)
  }

  if (query.category) addFilter('category = ?', query.category)
  if (query.type) addFilter('type = ?', query.type)
  if (query.ecosystem) addFilter('ecosystem = ?', query.ecosystem)

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
    orderSql: query.order === 'desc' ? 'DESC' : 'ASC',
  }
}

function mapSummary(row: SummaryRow): TechnologySummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    type: row.type,
    category: row.category,
    ...(row.ecosystem === null ? {} : { ecosystem: row.ecosystem }),
    ...(row.logo === null ? {} : { logo: row.logo }),
  }
}

export class TechnologyModel implements TechnologyRepository {
  constructor(private readonly database: Pool) {}

  async list(query: TechnologyListQuery): Promise<TechnologyCollection> {
    const built = buildTechnologyListQuery(query)
    const countResult = await this.database.query<{ total: string }>(
      `SELECT count(*)::text AS total FROM technologies ${built.whereSql}`,
      built.values,
    )
    const categoriesResult = await this.database.query<{ category: TechnologyCategory }>(
      'SELECT DISTINCT category FROM technologies ORDER BY category',
    )
    const values = [...built.values, built.limit, built.offset]
    const result = await this.database.query<SummaryRow>(
      `SELECT id, name, slug, description, type, category, ecosystem, logo
       FROM technologies ${built.whereSql}
       ORDER BY lower(name) ${built.orderSql}, slug ASC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    )
    const total = Number(countResult.rows[0]?.total ?? 0)

    return {
      data: result.rows.map(mapSummary),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
      filters: { categories: categoriesResult.rows.map((row) => row.category) },
    }
  }

  async findBySlug(slug: string): Promise<Technology | null> {
    const technologyResult = await this.database.query<TechnologyRow>(
      `SELECT id, name, slug, description, type, category, ecosystem, logo, context
       FROM technologies WHERE slug = $1`,
      [slug],
    )
    const row = technologyResult.rows[0]
    if (!row) return null

    const [useCasesResult, resourcesResult, relationshipsResult] = await Promise.all([
      this.database.query<{ use_case: string }>(
        'SELECT use_case FROM technology_use_cases WHERE technology_id = $1 ORDER BY position',
        [row.id],
      ),
      this.database.query<TechnologyResource & QueryResultRow>(
        'SELECT label, url, type FROM technology_resources WHERE technology_id = $1 ORDER BY position',
        [row.id],
      ),
      this.database.query<{ relationship_type: RelationshipType; target_technology_id: string } & QueryResultRow>(
        `SELECT relationship_type, target_technology_id
         FROM technology_relationships WHERE source_technology_id = $1
         ORDER BY relationship_type, target_technology_id`,
        [row.id],
      ),
    ])

    return {
      ...mapSummary(row),
      ...(row.context === null ? {} : { context: row.context }),
      useCases: useCasesResult.rows.map((item) => item.use_case),
      resources: resourcesResult.rows.map(({ label, url, type }) => ({ label, url, type })),
      relationships: relationshipsResult.rows.map((item) => ({
        type: item.relationship_type,
        targetId: item.target_technology_id,
      })),
    }
  }

  async findRelationships(slug: string) {
    const technologyResult = await this.database.query<SummaryRow>(
      `SELECT id, name, slug, description, type, category, ecosystem, logo
       FROM technologies WHERE slug = $1`,
      [slug],
    )
    const root = technologyResult.rows[0]
    if (!root) return null

    const result = await this.database.query<{
      relationship_type: RelationshipType
      source_technology_id: string
      target_technology_id: string
      source_id: string
      source_name: string
      source_slug: string
      source_description: string
      source_type: Technology['type']
      source_category: TechnologyCategory
      source_ecosystem: string | null
      source_logo: string | null
      target_id: string
      target_name: string
      target_slug: string
      target_description: string
      target_type: Technology['type']
      target_category: TechnologyCategory
      target_ecosystem: string | null
      target_logo: string | null
    } & QueryResultRow>(
      `SELECT r.relationship_type, r.source_technology_id, r.target_technology_id,
         source.id AS source_id, source.name AS source_name, source.slug AS source_slug,
         source.description AS source_description, source.type AS source_type,
         source.category AS source_category, source.ecosystem AS source_ecosystem, source.logo AS source_logo,
         target.id AS target_id, target.name AS target_name, target.slug AS target_slug,
         target.description AS target_description, target.type AS target_type,
         target.category AS target_category, target.ecosystem AS target_ecosystem, target.logo AS target_logo
       FROM technology_relationships r
       JOIN technologies source ON source.id = r.source_technology_id
       JOIN technologies target ON target.id = r.target_technology_id
       WHERE r.source_technology_id = $1 OR r.target_technology_id = $1
       ORDER BY r.relationship_type, lower(target.name), lower(source.name)`,
      [root.id],
    )

    const relationships: TechnologyRelationships['relationships'] = {
      alternative_to: [],
      commonly_used_with: [],
      built_on: [],
      part_of: [],
      related_to: [],
    }

    for (const row of result.rows) {
      const outgoing = row.source_technology_id === root.id
      const summary: TechnologySummary = outgoing
        ? {
            id: row.target_id, name: row.target_name, slug: row.target_slug,
            description: row.target_description, type: row.target_type,
            category: row.target_category,
            ...(row.target_ecosystem === null ? {} : { ecosystem: row.target_ecosystem }),
            ...(row.target_logo === null ? {} : { logo: row.target_logo }),
          }
        : {
            id: row.source_id, name: row.source_name, slug: row.source_slug,
            description: row.source_description, type: row.source_type,
            category: row.source_category,
            ...(row.source_ecosystem === null ? {} : { ecosystem: row.source_ecosystem }),
            ...(row.source_logo === null ? {} : { logo: row.source_logo }),
          }
      relationships[row.relationship_type].push({ technology: summary, direction: outgoing ? 'outgoing' : 'incoming' })
    }

    const symmetricTypes = new Set<RelationshipType>(['alternative_to', 'commonly_used_with', 'related_to'])
    for (const relationshipType of symmetricTypes) {
      const rows = relationships[relationshipType]
      const seen = new Set<string>()
      relationships[relationshipType] = rows.filter(({ technology }) => {
        if (seen.has(technology.id)) return false
        seen.add(technology.id)
        return true
      })
    }

    return { technology: mapSummary(root), relationships }
  }

  async listCategories(): Promise<TechnologyCategory[]> {
    const result = await this.database.query<{ category: TechnologyCategory }>(
      'SELECT DISTINCT category FROM technologies ORDER BY category',
    )
    return result.rows.map(({ category }) => category)
  }

  async ping() {
    await this.database.query('SELECT 1')
  }
}


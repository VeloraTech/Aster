export const technologyTypes = [
  'Programming language',
  'Framework',
  'Runtime',
  'Database',
  'Container tool',
  'Container platform',
  'Build tool',
  'Testing tool',
  'Library',
] as const

export type TechnologyType = (typeof technologyTypes)[number]

export const technologyCategories = [
  'Languages',
  'Frameworks',
  'Libraries',
  'Databases',
  'Runtimes',
  'Infrastructure',
  'DevOps',
  'Build Tools',
  'Testing',
] as const

export type TechnologyCategory = (typeof technologyCategories)[number]

export const relationshipTypes = [
  'alternative_to',
  'commonly_used_with',
  'built_on',
  'part_of',
  'related_to',
] as const

export type RelationshipType = (typeof relationshipTypes)[number]

export type TechnologyRelationship = {
  type: RelationshipType
  targetId: string
}

export type TechnologyResource = {
  label: string
  url: string
  type: 'Official website' | 'Documentation' | 'Source code'
}

export type TechnologySummary = {
  id: string
  name: string
  slug: string
  description: string
  type: TechnologyType
  category: TechnologyCategory
  ecosystem?: string
  logo?: string
}

export type Technology = TechnologySummary & {
  context?: string
  useCases: string[]
  relationships: TechnologyRelationship[]
  resources: TechnologyResource[]
}

export type TechnologyListQuery = {
  search?: string
  category?: TechnologyCategory
  type?: TechnologyType
  ecosystem?: string
  sort: 'name'
  order: 'asc' | 'desc'
  page: number
  limit: number
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type TechnologyCollection = {
  data: TechnologySummary[]
  pagination: Pagination
  filters: { categories: TechnologyCategory[] }
}

export type ResolvedRelationship = {
  technology: TechnologySummary
  direction: 'outgoing' | 'incoming'
}

export type TechnologyRelationships = {
  technology: TechnologySummary
  relationships: Record<RelationshipType, ResolvedRelationship[]>
}

export type ApiErrorCode =
  | 'INVALID_QUERY_PARAMETER'
  | 'TECHNOLOGY_NOT_FOUND'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_SERVER_ERROR'
  | 'ORIGIN_NOT_ALLOWED'
  | 'NOT_FOUND'

export type ApiErrorResponse = {
  error: { code: ApiErrorCode; message: string }
}

export type TechnologyRepository = {
  list(query: TechnologyListQuery): Promise<TechnologyCollection>
  findBySlug(slug: string): Promise<Technology | null>
  findRelationships(slug: string): Promise<TechnologyRelationships | null>
  listCategories(): Promise<TechnologyCategory[]>
  ping(): Promise<void>
}

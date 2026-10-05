import type {
  RelationshipType,
  ResolvedTechnologyRelationship,
  Technology,
  TechnologyCategory,
  TechnologySummary,
} from '../../types/technology'

export type ApiErrorBody = {
  error: { code: string; message: string }
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type TechnologyListResponse = {
  data: TechnologySummary[]
  pagination: Pagination
  filters: { categories: TechnologyCategory[] }
}

export type TechnologyDetailResponse = { data: Technology }

export type RelationshipTarget = {
  technology: TechnologySummary
  direction: 'incoming' | 'outgoing'
}

export type RelationshipGroups = Record<RelationshipType, RelationshipTarget[]>

export type TechnologyRelationshipsResponse = {
  data: { technology: TechnologySummary; relationships: RelationshipGroups }
}

export type TechnologyRelationshipsView = {
  technology: TechnologySummary
  relationships: ResolvedTechnologyRelationship[]
}

export type TechnologyListParams = {
  page?: number
  limit?: number
  search?: string
  category?: TechnologyCategory
  type?: Technology['type']
  ecosystem?: string
  sort?: 'name'
  order?: 'asc' | 'desc'
}

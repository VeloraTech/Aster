import { relationshipTypes, technologyCategories, technologyTypes } from '../../types/technology'
import type {
  ApiErrorBody,
  RelationshipGroups,
  TechnologyDetailResponse,
  TechnologyListParams,
  TechnologyListResponse,
  TechnologyRelationshipsResponse,
  TechnologyRelationshipsView,
} from './types'
import type { RelationshipType, Technology, TechnologySummary } from '../../types/technology'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

export class ApiRequestError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string) {
    super(code === 'TECHNOLOGY_NOT_FOUND'
      ? 'Technology not found.'
      : code === 'INVALID_QUERY_PARAMETER'
        ? 'The search filters are invalid.'
        : 'The technology service is unavailable.')
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isSummary(value: unknown): value is TechnologySummary {
  if (!isObject(value)) return false
  return isString(value.id)
    && isString(value.name)
    && isString(value.slug)
    && isString(value.description)
    && technologyTypes.includes(value.type as Technology['type'])
    && technologyCategories.includes(value.category as Technology['category'])
    && (value.ecosystem === undefined || isString(value.ecosystem))
    && (value.logo === undefined || isString(value.logo))
}

function parseTechnology(value: unknown): Technology {
  if (!isObject(value) || !isSummary(value)) throw new Error('The API returned an invalid technology.')
  const details: Record<string, unknown> = value
  const validRelationships = Array.isArray(details.relationships) && details.relationships.every((item) =>
    isObject(item)
      && relationshipTypes.includes(item.type as RelationshipType)
      && isString(item.targetId),
  )
  const validResources = Array.isArray(details.resources) && details.resources.every((item) =>
    isObject(item)
      && isString(item.label)
      && isString(item.url)
      && ['Official website', 'Documentation', 'Source code'].includes(String(item.type)),
  )

  if (!isStringArray(details.useCases) || !validRelationships || !validResources
    || (details.context !== undefined && !isString(details.context))) {
    throw new Error('The API returned an invalid technology detail.')
  }

  return value as unknown as Technology
}

function parseTechnologyList(value: unknown): TechnologyListResponse {
  if (!isObject(value) || !Array.isArray(value.data) || !isObject(value.pagination) || !isObject(value.filters)) {
    throw new Error('The API returned an invalid technology collection.')
  }
  const { page, limit, total, totalPages } = value.pagination
  const categories = value.filters.categories
  const validPagination = [page, limit, total, totalPages].every((part) => Number.isSafeInteger(part) && Number(part) >= 0)
    && Number(limit) > 0
    && Number(page) > 0
  if (!validPagination || !Array.isArray(categories)
    || !categories.every((category) => technologyCategories.includes(category as Technology['category']))
    || !value.data.every(isSummary)) {
    throw new Error('The API returned an invalid technology collection.')
  }

  return value as unknown as TechnologyListResponse
}

function parseRelationshipGroups(value: unknown): RelationshipGroups {
  if (!isObject(value)) throw new Error('The API returned invalid technology relationships.')
  const groups = {} as RelationshipGroups
  for (const relationshipType of relationshipTypes) {
    const records = value[relationshipType]
    if (!Array.isArray(records) || !records.every((record) =>
      isObject(record)
        && isSummary(record.technology)
        && (record.direction === 'incoming' || record.direction === 'outgoing'),
    )) {
      throw new Error('The API returned invalid technology relationships.')
    }
    groups[relationshipType] = records as RelationshipGroups[typeof relationshipType]
  }
  return groups
}

function isApiError(value: unknown): value is ApiErrorBody {
  return isObject(value)
    && isObject(value.error)
    && isString(value.error.code)
    && isString(value.error.message)
}

async function getJson<T>(path: string, parse: (value: unknown) => T, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiRequestError(0, 'SERVICE_UNAVAILABLE')
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('The API returned an unreadable response.')
  }
  if (!response.ok) {
    const code = isApiError(body) ? body.error.code : 'INTERNAL_SERVER_ERROR'
    throw new ApiRequestError(response.status, code)
  }
  return parse(body)
}

export function fetchTechnologies(params: TechnologyListParams = {}, signal?: AbortSignal) {
  const query = new URLSearchParams()
  query.set('page', String(params.page ?? 1))
  query.set('limit', String(params.limit ?? 20))
  query.set('sort', params.sort ?? 'name')
  query.set('order', params.order ?? 'asc')
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  if (params.type) query.set('type', params.type)
  if (params.ecosystem) query.set('ecosystem', params.ecosystem)
  return getJson(`/technologies?${query}`, parseTechnologyList, signal)
}

export async function fetchTechnology(slug: string, signal?: AbortSignal) {
  const response = await getJson(`/technologies/${encodeURIComponent(slug)}`, (value): TechnologyDetailResponse => {
    if (!isObject(value) || !('data' in value)) throw new Error('The API returned an invalid technology detail.')
    return { data: parseTechnology(value.data) }
  }, signal)
  return response.data
}

export async function fetchTechnologyRelationships(slug: string, signal?: AbortSignal): Promise<TechnologyRelationshipsView> {
  const response = await getJson(`/technologies/${encodeURIComponent(slug)}/relationships`, (value): TechnologyRelationshipsResponse => {
    if (!isObject(value) || !isObject(value.data) || !isSummary(value.data.technology)) {
      throw new Error('The API returned invalid technology relationships.')
    }
    return {
      data: {
        technology: value.data.technology,
        relationships: parseRelationshipGroups(value.data.relationships),
      },
    }
  }, signal)

  return {
    technology: response.data.technology,
    relationships: relationshipTypes.flatMap((type) => response.data.relationships[type].map((entry) => ({
      type,
      technology: entry.technology,
      direction: entry.direction,
    }))),
  }
}

import { ApiError } from '../errors.js'
import {
  technologyCategories,
  technologyTypes,
  type TechnologyCategory,
  type TechnologyListQuery,
  type TechnologyRepository,
  type TechnologyType,
} from '../types/technology.js'

const allowedParameters = new Set(['search', 'category', 'type', 'ecosystem', 'sort', 'order', 'page', 'limit'])

function invalidParameter(name: string, detail: string): never {
  throw new ApiError(400, 'INVALID_QUERY_PARAMETER', `The "${name}" query parameter ${detail}.`)
}

function getString(query: Record<string, unknown>, name: string) {
  const value = query[name]
  if (value === undefined) return undefined
  if (typeof value !== 'string') invalidParameter(name, 'must be provided once as a string')
  return value
}

function getPositiveInteger(query: Record<string, unknown>, name: string, defaultValue: number, maximum: number) {
  const rawValue = getString(query, name)
  if (rawValue === undefined) return defaultValue
  if (!/^\d+$/.test(rawValue)) invalidParameter(name, 'must be a positive integer')
  const value = Number(rawValue)
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    invalidParameter(name, `must be between 1 and ${maximum}`)
  }
  return value
}

function isOneOf<T extends string>(value: string, values: readonly T[]): value is T {
  return values.includes(value as T)
}

export function parseTechnologyListQuery(query: Record<string, unknown>): TechnologyListQuery {
  const unknownParameter = Object.keys(query).find((key) => !allowedParameters.has(key))
  if (unknownParameter) invalidParameter(unknownParameter, 'is not supported')

  const searchValue = getString(query, 'search')?.trim()
  if (searchValue && searchValue.length > 120) invalidParameter('search', 'must be no more than 120 characters')

  const categoryValue = getString(query, 'category')
  if (categoryValue !== undefined && !isOneOf(categoryValue, technologyCategories)) {
    invalidParameter('category', 'is not supported')
  }

  const typeValue = getString(query, 'type')
  if (typeValue !== undefined && !isOneOf(typeValue, technologyTypes)) {
    invalidParameter('type', 'is not supported')
  }

  const ecosystemValue = getString(query, 'ecosystem')?.trim()
  if (ecosystemValue && ecosystemValue.length > 100) invalidParameter('ecosystem', 'must be no more than 100 characters')

  const sortValue = getString(query, 'sort') ?? 'name'
  if (sortValue !== 'name') invalidParameter('sort', 'must be "name"')

  const orderValue = getString(query, 'order') ?? 'asc'
  if (orderValue !== 'asc' && orderValue !== 'desc') invalidParameter('order', 'must be "asc" or "desc"')

  return {
    search: searchValue || undefined,
    category: categoryValue as TechnologyCategory | undefined,
    type: typeValue as TechnologyType | undefined,
    ecosystem: ecosystemValue || undefined,
    sort: 'name',
    order: orderValue,
    page: getPositiveInteger(query, 'page', 1, 100_000),
    limit: getPositiveInteger(query, 'limit', 20, 100),
  }
}

export class TechnologyService {
  constructor(private readonly repository: TechnologyRepository) {}

  list(query: Record<string, unknown>) {
    return this.repository.list(parseTechnologyListQuery(query))
  }

  getBySlug(slug: string) {
    return this.repository.findBySlug(slug)
  }

  getRelationships(slug: string) {
    return this.repository.findRelationships(slug)
  }

  listCategories() {
    return this.repository.listCategories()
  }

  ping() {
    return this.repository.ping()
  }
}

import type { Technology } from '../../../types/technology'
import type { ExploreFilters, PaginationState } from '../types'

export function filterAndSortTechnologies(
  items: readonly Technology[],
  filters: ExploreFilters,
): Technology[] {
  const query = filters.query.trim().toLowerCase()

  return items
    .filter((technology) => {
      const matchesCategory =
        filters.category === 'all' || technology.category === filters.category
      const searchableText = [
        technology.name,
        technology.description,
        technology.type,
        technology.category,
        technology.ecosystem,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesCategory && (!query || searchableText.includes(query))
    })
    .sort((first, second) => {
      const nameOrder = first.name.localeCompare(second.name)
      return filters.sortOrder === 'name-asc' ? nameOrder : -nameOrder
    })
}

export type PaginatedItems<T> = PaginationState & {
  items: T[]
}

export function paginateItems<T>(
  items: readonly T[],
  requestedPage: number,
  pageSize: number,
): PaginatedItems<T> {
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const currentPage = Math.min(Math.max(requestedPage, 1), Math.max(totalPages, 1))
  const startIndex = (currentPage - 1) * pageSize

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    currentPage,
    pageSize,
    totalItems,
    totalPages,
  }
}

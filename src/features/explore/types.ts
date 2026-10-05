import type { TechnologyCategory } from '../../types/technology'

export type ExploreCategoryFilter = TechnologyCategory | 'all'

export type SortOrder = 'name-asc' | 'name-desc'

export type ExploreFilters = {
  query: string
  category: ExploreCategoryFilter
  sortOrder: SortOrder
}

export type PaginationState = {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

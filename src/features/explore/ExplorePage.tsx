import { useEffect, useState } from 'react'
import ExplorePagination from './components/ExplorePagination'
import ExploreToolbar from './components/ExploreToolbar'
import TechnologyCard from './components/TechnologyCard'
import type { ExploreFilters } from './types'
import { fetchTechnologies } from '../../lib/api/client'
import type { TechnologyListResponse } from '../../lib/api/types'

const pageSize = 8

const initialFilters: ExploreFilters = {
  query: '',
  category: 'all',
  sortOrder: 'name-asc',
}

export default function ExplorePage() {
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [requestState, setRequestState] = useState<{
    key: string
    status: 'ready' | 'error'
    response?: TechnologyListResponse
  }>()
  const [retryCount, setRetryCount] = useState(0)
  const requestKey = JSON.stringify([currentPage, filters.category, filters.query, filters.sortOrder, retryCount])

  useEffect(() => {
    const controller = new AbortController()
    void fetchTechnologies({
      page: currentPage,
      limit: pageSize,
      search: filters.query,
      category: filters.category === 'all' ? undefined : filters.category,
      sort: 'name',
      order: filters.sortOrder === 'name-asc' ? 'asc' : 'desc',
    }, controller.signal).then((data) => {
      setRequestState({ key: requestKey, status: 'ready', response: data })
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setRequestState({ key: requestKey, status: 'error' })
    })
    return () => controller.abort()
  }, [currentPage, filters.category, filters.query, filters.sortOrder, requestKey, retryCount])

  const currentRequest = requestState?.key === requestKey ? requestState : undefined
  const response = currentRequest?.response
  const status = currentRequest?.status ?? 'loading'

  const pagination = response ? {
    currentPage: response.pagination.page,
    pageSize: response.pagination.limit,
    totalItems: response.pagination.total,
    totalPages: response.pagination.totalPages,
    items: response.data,
  } : undefined
  const activeFilters = filters.query.trim().length > 0 || filters.category !== 'all'
  const firstResult = pagination && pagination.totalItems > 0 ? (pagination.currentPage - 1) * pageSize + 1 : 0
  const lastResult = pagination ? Math.min(pagination.currentPage * pageSize, pagination.totalItems) : 0

  function updateQuery(query: string) {
    setFilters((current) => ({ ...current, query }))
    setCurrentPage(1)
  }

  function updateCategory(category: ExploreFilters['category']) {
    setFilters((current) => ({ ...current, category }))
    setCurrentPage(1)
  }

  function updateSort(sortOrder: ExploreFilters['sortOrder']) {
    setFilters((current) => ({ ...current, sortOrder }))
    setCurrentPage(1)
  }

  function clearAllFilters() {
    setFilters((current) => ({ ...current, query: '', category: 'all' }))
    setCurrentPage(1)
  }

  return (
    <section className="explore-page" aria-labelledby="explore-title">
      <header className="explore-intro">
        <p className="eyebrow">
          <span className="eyebrow-line" aria-hidden="true" />
          A curated starting collection
        </p>
        <h1 id="explore-title">Explore technology.</h1>
        <p>
          Find a technology by name or category, then follow a path into its wider ecosystem.
        </p>
      </header>

      <ExploreToolbar
        categories={response?.filters.categories ?? []}
        filters={filters}
        onQueryChange={updateQuery}
        onCategoryChange={updateCategory}
        onSortChange={updateSort}
      />

      {status === 'loading' && <p className="api-loading-state" role="status">Loading technologies…</p>}

      {status === 'error' && (
        <section className="api-error-state" role="alert">
          <p>Unable to load technologies. Please try again.</p>
          <button className="text-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button>
        </section>
      )}

      {status === 'ready' && pagination && (
        <>
          <div className="explore-results-heading">
            <p className="results-count" role="status" aria-live="polite" aria-atomic="true">
              {pagination.totalItems === 0
                ? 'No technologies found'
                : `Showing ${firstResult} to ${lastResult} of ${pagination.totalItems} technologies`}
            </p>
            <p className="sort-summary">
              {filters.category === 'all' ? 'All categories' : filters.category}
            </p>
          </div>
        </>
      )}

      {status === 'ready' && pagination && pagination.totalItems > 0 ? (
        <>
          <ul className="technology-grid" aria-label="Technology results">
            {pagination.items.map((technology) => (
              <li key={technology.id}>
                <TechnologyCard technology={technology} />
              </li>
            ))}
          </ul>
          <ExplorePagination pagination={pagination} onPageChange={setCurrentPage} />
        </>
      ) : status === 'ready' && pagination ? (
        <section className="explore-empty-state" aria-labelledby="empty-state-title">
          <p className="eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            Nothing in this view
          </p>
          <h2 id="empty-state-title">No technologies match those filters.</h2>
          <p>Try another search or clear one of the filters to widen your results.</p>
          <div className="empty-state-actions">
            {filters.query.trim() && (
              <button className="text-button" type="button" onClick={() => updateQuery('')}>
                Clear search
              </button>
            )}
            {filters.category !== 'all' && (
              <button className="text-button" type="button" onClick={() => updateCategory('all')}>
                Clear category
              </button>
            )}
            {activeFilters && (
              <button className="text-button" type="button" onClick={clearAllFilters}>
                Reset all filters
              </button>
            )}
          </div>
        </section>
      ) : null}
    </section>
  )
}

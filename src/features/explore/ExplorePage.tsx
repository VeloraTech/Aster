import { useState } from 'react'
import ExplorePagination from './components/ExplorePagination'
import ExploreToolbar from './components/ExploreToolbar'
import TechnologyCard from './components/TechnologyCard'
import { technologies } from '../../data/technologies'
import type { ExploreFilters } from './types'
import { filterAndSortTechnologies, paginateItems } from './utils/queryTechnologies'

const pageSize = 8
const categories = [...new Set(technologies.map((technology) => technology.category))]

const initialFilters: ExploreFilters = {
  query: '',
  category: 'all',
  sortOrder: 'name-asc',
}

export default function ExplorePage() {
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const filteredTechnologies = filterAndSortTechnologies(technologies, filters)
  const pagination = paginateItems(filteredTechnologies, currentPage, pageSize)
  const activeFilters = filters.query.trim().length > 0 || filters.category !== 'all'
  const firstResult = pagination.totalItems === 0 ? 0 : (pagination.currentPage - 1) * pageSize + 1
  const lastResult = Math.min(pagination.currentPage * pageSize, pagination.totalItems)

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
        categories={categories}
        filters={filters}
        onQueryChange={updateQuery}
        onCategoryChange={updateCategory}
        onSortChange={updateSort}
      />

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

      {pagination.totalItems > 0 ? (
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
      ) : (
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
      )}
    </section>
  )
}

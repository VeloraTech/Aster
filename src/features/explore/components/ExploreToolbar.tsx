import type { TechnologyCategory } from '../../../types/technology'
import type { ExploreFilters, SortOrder } from '../types'

type ExploreToolbarProps = {
  categories: readonly TechnologyCategory[]
  filters: ExploreFilters
  onQueryChange: (query: string) => void
  onCategoryChange: (category: ExploreFilters['category']) => void
  onSortChange: (sortOrder: SortOrder) => void
}

export default function ExploreToolbar({
  categories,
  filters,
  onQueryChange,
  onCategoryChange,
  onSortChange,
}: ExploreToolbarProps) {
  return (
    <section className="explore-toolbar" aria-label="Search and filter technologies">
      <div className="search-control">
        <label htmlFor="technology-search">Search the collection</label>
        <div className="search-input-wrap">
          <input
            id="technology-search"
            type="search"
            autoComplete="off"
            placeholder="Try React, databases, or testing"
            value={filters.query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
          />
        </div>
      </div>

      <fieldset className="category-control">
        <legend>Browse by category</legend>
        <div className="category-options">
          <button
            className="category-option"
            type="button"
            aria-pressed={filters.category === 'all'}
            onClick={() => onCategoryChange('all')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              className="category-option"
              type="button"
              key={category}
              aria-pressed={filters.category === category}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="sort-control">
        <label htmlFor="technology-sort">Sort by</label>
        <select
          id="technology-sort"
          value={filters.sortOrder}
          onChange={(event) => onSortChange(event.currentTarget.value as SortOrder)}
        >
          <option value="name-asc">Name A to Z</option>
          <option value="name-desc">Name Z to A</option>
        </select>
      </div>
    </section>
  )
}

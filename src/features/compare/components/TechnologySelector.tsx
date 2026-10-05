import { useState } from 'react'
import type { Technology } from '../../../types/technology'
import { maxComparisonTechnologies } from '../hooks/useComparisonSelection'

type TechnologySelectorProps = {
  technologies: Technology[]
  selected: Technology[]
  onAdd: (slug: string) => void
  onRemove: (slug: string) => void
  onClear: () => void
}

const initialResultCount = 8

export default function TechnologySelector({
  technologies,
  selected,
  onAdd,
  onRemove,
  onClear,
}: TechnologySelectorProps) {
  const [query, setQuery] = useState('')
  const selectedSlugs = new Set(selected.map((technology) => technology.slug))
  const limitReached = selected.length >= maxComparisonTechnologies
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const matchingTechnologies = technologies
    .filter((technology) => !selectedSlugs.has(technology.slug))
    .filter((technology) => {
      if (!normalizedQuery) return true
      return [technology.name, technology.description, technology.type, technology.category, technology.ecosystem]
        .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery))
    })
    .sort((first, second) => first.name.localeCompare(second.name))
  const visibleTechnologies = query.trim()
    ? matchingTechnologies
    : matchingTechnologies.slice(0, initialResultCount)

  return (
    <section className="compare-selector" aria-labelledby="compare-selector-title">
      <div className="compare-selector-heading">
        <div>
          <h2 id="compare-selector-title">Choose technologies</h2>
          <p>Select two to four technologies. You can search by name, type, or category.</p>
        </div>
        {selected.length > 0 && (
          <button className="text-button compare-clear-button" type="button" onClick={onClear}>
            Clear selection
          </button>
        )}
      </div>

      <ul className="comparison-selection" aria-label="Selected technologies">
        {selected.map((technology) => (
          <li key={technology.slug}>
            <span>{technology.name}</span>
            <button
              type="button"
              aria-label={`Remove ${technology.name} from comparison`}
              onClick={() => onRemove(technology.slug)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="compare-search-control">
        <label htmlFor="compare-technology-search">Search technologies to add</label>
        <input
          id="compare-technology-search"
          type="search"
          value={query}
          disabled={limitReached}
          onChange={(event) => setQuery(event.target.value)}
          aria-describedby={limitReached ? 'compare-limit-message' : 'compare-search-help'}
          placeholder="Try React, language, or database"
        />
        {limitReached ? (
          <p className="compare-limit-message" id="compare-limit-message" role="status">
            You have reached the four technology limit. Remove one to add another.
          </p>
        ) : (
          <p className="compare-search-help" id="compare-search-help">
            {query.trim()
              ? `${matchingTechnologies.length} matching ${matchingTechnologies.length === 1 ? 'technology' : 'technologies'}`
              : `Showing ${visibleTechnologies.length} of ${matchingTechnologies.length}. Search to narrow the list.`}
          </p>
        )}
      </div>

      {visibleTechnologies.length > 0 ? (
        <ul className="compare-search-results" aria-label="Technology search results">
          {visibleTechnologies.map((technology) => (
            <li key={technology.slug}>
              <button type="button" onClick={() => onAdd(technology.slug)} disabled={limitReached}>
                <span className="compare-result-name">{technology.name}</span>
                <span className="compare-result-meta">{technology.category} · {technology.type}</span>
                <span className="compare-result-action" aria-hidden="true">Add +</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="compare-selector-empty" role="status">
          No available technologies match that search.
        </p>
      )}
    </section>
  )
}

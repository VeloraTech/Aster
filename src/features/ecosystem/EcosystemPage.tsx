import { useEffect, useState } from 'react'
import { fetchTechnologies, fetchTechnology, fetchTechnologyRelationships, ApiRequestError } from '../../lib/api/client'
import type { TechnologyListResponse } from '../../lib/api/types'
import { relationshipDefinitions, relationshipTypes, type RelationshipType, type Technology } from '../../types/technology'
import TechnologyRelationSection from '../technology/components/TechnologyRelationSection'
import EcosystemGraph from './EcosystemGraph'

type StartingTechnologyState =
  | { slug: string; status: 'not-found' | 'error' }
  | { slug: string; status: 'ready'; technology: Technology; relationships: Awaited<ReturnType<typeof fetchTechnologyRelationships>>['relationships']; relationshipError: boolean }

type SearchState = {
  query: string
  status: 'ready' | 'error'
  response?: TechnologyListResponse
}

export default function EcosystemPage() {
  const [requestedSlug, setRequestedSlug] = useState(() => new URLSearchParams(window.location.search).get('technology') ?? '')
  const [query, setQuery] = useState('')
  const [searchState, setSearchState] = useState<SearchState>({ query: '', status: 'ready' })
  const [startingState, setStartingState] = useState<StartingTechnologyState>()
  const [retryCount, setRetryCount] = useState(0)
  const [searchRetryCount, setSearchRetryCount] = useState(0)
  const [visibleTypes, setVisibleTypes] = useState<RelationshipType[]>([...relationshipTypes])
  const normalizedQuery = query.trim()

  useEffect(() => {
    const syncSelection = () => setRequestedSlug(new URLSearchParams(window.location.search).get('technology') ?? '')
    window.addEventListener('popstate', syncSelection)
    return () => window.removeEventListener('popstate', syncSelection)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    if (!normalizedQuery) return () => controller.abort()
    void fetchTechnologies({ search: normalizedQuery, page: 1, limit: 8 }, controller.signal)
      .then((response) => setSearchState({ query: normalizedQuery, status: 'ready', response }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setSearchState({ query: normalizedQuery, status: 'error' })
      })
    return () => controller.abort()
  }, [normalizedQuery, searchRetryCount])

  useEffect(() => {
    if (!requestedSlug) return
    const controller = new AbortController()
    void Promise.allSettled([
      fetchTechnology(requestedSlug, controller.signal),
      fetchTechnologyRelationships(requestedSlug, controller.signal),
    ]).then(([technologyResult, relationshipResult]) => {
      if (controller.signal.aborted) return
      if (technologyResult.status === 'rejected') {
        setStartingState({
          slug: requestedSlug,
          status: technologyResult.reason instanceof ApiRequestError && technologyResult.reason.status === 404
            ? 'not-found'
            : 'error',
        })
        return
      }
      setStartingState({
        slug: requestedSlug,
        status: 'ready',
        technology: technologyResult.value,
        relationships: relationshipResult.status === 'fulfilled' ? relationshipResult.value.relationships : [],
        relationshipError: relationshipResult.status === 'rejected',
      })
    })
    return () => controller.abort()
  }, [requestedSlug, retryCount])

  const matching = searchState.query === normalizedQuery ? searchState : undefined
  const selected = startingState?.slug === requestedSlug && startingState.status === 'ready' ? startingState : undefined
  const loadingTechnology = Boolean(requestedSlug) && startingState?.slug !== requestedSlug
  const filteredRelationships = selected?.relationships.filter((relationship) => visibleTypes.includes(relationship.type)) ?? []

  const selectTechnology = (slug: string) => {
    if (slug === requestedSlug) return
    window.history.pushState({}, '', `/ecosystem?technology=${encodeURIComponent(slug)}`)
    setRequestedSlug(slug)
  }

  const toggleType = (type: RelationshipType) => {
    setVisibleTypes((current) => current.includes(type)
      ? current.filter((item) => item !== type)
      : [...current, type])
  }

  return (
    <div className="ecosystem-page">
      <header className="ecosystem-intro">
        <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Technology relationships</p>
        <h1>Explore how technologies connect.</h1>
        <p>Choose a starting point to see what it is commonly used with, what it builds on, and where alternatives fit.</p>
      </header>

      <section className="ecosystem-picker" aria-labelledby="ecosystem-picker-title">
        <div className="ecosystem-picker-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Start somewhere</p>
            <h2 id="ecosystem-picker-title">Explore an ecosystem</h2>
          </div>
          {requestedSlug && <a href="/ecosystem">Clear starting point</a>}
        </div>
        <label htmlFor="ecosystem-technology-search">Search technologies</label>
        <input
          id="ecosystem-technology-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try React, PostgreSQL, or Docker"
          autoComplete="off"
        />
        {normalizedQuery && !matching && <p className="ecosystem-search-empty" role="status">Searching the collection…</p>}
        {normalizedQuery && matching?.status === 'error' && (
          <div className="ecosystem-search-empty" role="alert">
            <p>Unable to search technologies.</p>
            <button className="text-button" type="button" onClick={() => setSearchRetryCount((count) => count + 1)}>Try again</button>
          </div>
        )}
        {normalizedQuery && matching?.status === 'ready' && matching.response && (
          matching.response.data.length > 0 ? (
            <ul className="ecosystem-search-results" aria-label="Matching technologies">
              {matching.response.data.map((technology) => (
                <li key={technology.id}>
                  <a href={`/ecosystem?technology=${encodeURIComponent(technology.slug)}`}>
                    <span>{technology.name}</span>
                    <small>{technology.category} · {technology.type}</small>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ecosystem-search-empty" role="status">No technologies match “{normalizedQuery}”.</p>
          )
        )}
      </section>

      {requestedSlug && startingState?.slug === requestedSlug && startingState.status === 'not-found' && (
        <p className="ecosystem-notice" role="status">This technology is not in the collection. Search above to choose another starting point.</p>
      )}
      {requestedSlug && startingState?.slug === requestedSlug && startingState.status === 'error' && (
        <section className="api-error-state" role="alert">
          <p>Unable to load this technology ecosystem. Please try again.</p>
          <button className="text-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button>
        </section>
      )}
      {loadingTechnology && <p className="api-loading-state" role="status">Loading technology relationships…</p>}

      {selected && (
        <div className="ecosystem-exploration">
          <section className="ecosystem-focus" aria-labelledby="ecosystem-focus-title">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Current focus</p>
              <h2 id="ecosystem-focus-title">{selected.technology.name}</h2>
              <p>{selected.technology.description}</p>
              <a className="technology-ecosystem-link" href={`/technologies/${selected.technology.slug}`}>
                View technology details <span aria-hidden="true">→</span>
              </a>
            </div>
            <p className="ecosystem-focus-meta">{selected.technology.category} · {selected.technology.type}{selected.technology.ecosystem ? ` · ${selected.technology.ecosystem}` : ''}</p>
          </section>

          <fieldset className="ecosystem-filters">
            <legend>Show relationship types</legend>
            {relationshipTypes.map((type) => (
              <label key={type}>
                <input type="checkbox" checked={visibleTypes.includes(type)} onChange={() => toggleType(type)} />
                <span>{relationshipDefinitions[type].label}</span>
              </label>
            ))}
          </fieldset>

          <EcosystemGraph
            focusedTechnology={selected.technology}
            relationships={selected.relationshipError ? [] : filteredRelationships}
            onSelectTechnology={selectTechnology}
            error={selected.relationshipError}
            emptyMessage={selected.relationships.length > 0
              ? 'No relationships match the selected categories. Choose another relationship type above.'
              : undefined}
          />

          {selected.relationshipError ? (
            <TechnologyRelationSection
              id="ecosystem-relationships-title"
              relationships={[]}
              errorMessage="Unable to load relationships. Please try again."
            />
          ) : (
            <TechnologyRelationSection
              id="ecosystem-relationships-title"
              relationships={filteredRelationships}
              emptyMessage={selected.relationships.length > 0
                ? 'No relationships match the selected categories. Choose another relationship type above.'
                : undefined}
            />
          )}
        </div>
      )}

      {!requestedSlug && (
        <section className="ecosystem-start-state" aria-labelledby="ecosystem-start-title">
          <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />A connected view</p>
          <h2 id="ecosystem-start-title">One technology leads to another.</h2>
          <p>Select a technology to inspect its relationships, then follow a connection into the next detail page.</p>
        </section>
      )}
    </div>
  )
}

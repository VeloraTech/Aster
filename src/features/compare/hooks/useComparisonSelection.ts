import { useEffect, useState } from 'react'
import { fetchTechnologies, fetchTechnology, fetchTechnologyRelationships } from '../../../lib/api/client'
import type { ResolvedTechnologyRelationship, Technology, TechnologySummary } from '../../../types/technology'
import type { ComparisonSelection } from '../types'

export const maxComparisonTechnologies = 4

function readSelectionFromUrl(): ComparisonSelection {
  const rawSlugs = new URLSearchParams(window.location.search).get('technologies')
  const slugs: string[] = []
  const seen = new Set<string>()
  let duplicateCount = 0

  for (const rawSlug of (rawSlugs ?? '').split(',')) {
    const slug = rawSlug.trim()
    if (!slug) continue
    if (seen.has(slug)) {
      duplicateCount += 1
      continue
    }
    seen.add(slug)
    slugs.push(slug)
  }

  const selected = slugs.slice(0, maxComparisonTechnologies)
  return {
    slugs: selected,
    unknownSlugs: [],
    duplicateCount,
    truncatedCount: Math.max(0, slugs.length - selected.length),
  }
}

type CatalogueState = {
  status: 'loading' | 'ready' | 'error'
  technologies: TechnologySummary[]
}

type DetailState = {
  requestKey: string
  technologies: Record<string, Technology>
  relationships: Record<string, ResolvedTechnologyRelationship[]>
  failedSlugs: string[]
}

export default function useComparisonSelection() {
  const [selection, setSelection] = useState(readSelectionFromUrl)
  const [catalogue, setCatalogue] = useState<CatalogueState>({ status: 'loading', technologies: [] })
  const [catalogueRetry, setCatalogueRetry] = useState(0)
  const [detailRetry, setDetailRetry] = useState(0)
  const [detailState, setDetailState] = useState<DetailState>({ requestKey: '', technologies: {}, relationships: {}, failedSlugs: [] })

  useEffect(() => {
    const controller = new AbortController()
    void fetchTechnologies({ page: 1, limit: 100, sort: 'name', order: 'asc' }, controller.signal)
      .then((response) => setCatalogue({ status: 'ready', technologies: response.data }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setCatalogue({ status: 'error', technologies: [] })
      })
    return () => controller.abort()
  }, [catalogueRetry])

  const catalogueIds = new Set(catalogue.technologies.map((technology) => technology.slug))
  const validSlugs = catalogue.status === 'ready'
    ? selection.slugs.filter((slug) => catalogueIds.has(slug))
    : []
  const detailRequestKey = validSlugs.join(',')

  useEffect(() => {
    if (!detailRequestKey || catalogue.status !== 'ready') return
    const controller = new AbortController()
    const slugs = detailRequestKey.split(',')
    void Promise.all(slugs.map(async (slug) => {
      const [technologyResult, relationshipResult] = await Promise.allSettled([
        fetchTechnology(slug, controller.signal),
        fetchTechnologyRelationships(slug, controller.signal),
      ])
      if (technologyResult.status === 'rejected') return { slug, status: 'error' as const }
      return {
        slug,
        status: 'ready' as const,
        error: relationshipResult.status === 'rejected',
        technology: technologyResult.value,
        relationships: relationshipResult.status === 'fulfilled' ? relationshipResult.value.relationships : [],
      }
    })).then((results) => {
      if (controller.signal.aborted) return
      const technologies: Record<string, Technology> = {}
      const relationships: Record<string, ResolvedTechnologyRelationship[]> = {}
      const failedSlugs: string[] = []
      for (const result of results) {
        if (result.status === 'error') {
          failedSlugs.push(result.slug)
          continue
        }
        technologies[result.slug] = result.technology
        relationships[result.slug] = result.relationships
        if (result.error) failedSlugs.push(result.slug)
      }
      setDetailState({ requestKey: detailRequestKey, technologies, relationships, failedSlugs })
    })
    return () => controller.abort()
  }, [catalogue.status, detailRequestKey, detailRetry])

  useEffect(() => {
    function handlePopState() {
      setSelection(readSelectionFromUrl())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const unknownSlugs = catalogue.status === 'ready'
    ? selection.slugs.filter((slug) => !catalogueIds.has(slug))
    : []
  const currentDetailState = detailState.requestKey === detailRequestKey ? detailState : undefined
  const selectedTechnologies = validSlugs.flatMap((slug) => {
    const technology = currentDetailState?.technologies[slug]
    return technology ? [technology] : []
  })

  function commitSelection(slugs: string[]) {
    const uniqueSlugs = [...new Set(slugs)].slice(0, maxComparisonTechnologies)
    const nextUrl = new URL(window.location.href)
    if (uniqueSlugs.length > 0) nextUrl.searchParams.set('technologies', uniqueSlugs.join(','))
    else nextUrl.searchParams.delete('technologies')
    window.history.pushState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
    setSelection({ slugs: uniqueSlugs, unknownSlugs: [], duplicateCount: 0, truncatedCount: 0 })
  }

  function addTechnology(slug: string) {
    if (selection.slugs.includes(slug) || selection.slugs.length >= maxComparisonTechnologies || !catalogueIds.has(slug)) return
    commitSelection([...selection.slugs, slug])
  }

  function removeTechnology(slug: string) {
    commitSelection(selection.slugs.filter((selectedSlug) => selectedSlug !== slug))
  }

  return {
    selection: { ...selection, unknownSlugs },
    selectedTechnologies,
    relationshipsByTechnology: currentDetailState?.relationships ?? {},
    failedSlugs: currentDetailState?.failedSlugs ?? [],
    loadingSelected: validSlugs.length > 0 && !currentDetailState,
    availableTechnologies: catalogue.technologies,
    catalogueLoading: catalogue.status === 'loading',
    catalogueError: catalogue.status === 'error',
    retryCatalogue: () => setCatalogueRetry((count) => count + 1),
    retryDetails: () => setDetailRetry((count) => count + 1),
    addTechnology,
    removeTechnology,
    clearSelection: () => commitSelection([]),
  }
}

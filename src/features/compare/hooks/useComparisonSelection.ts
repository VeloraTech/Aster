import { useEffect, useState } from 'react'
import { findTechnologyBySlug, technologies } from '../../../data/technologies'
import type { ComparisonSelection } from '../types'

export const maxComparisonTechnologies = 4

function readSelectionFromUrl(): ComparisonSelection {
  const rawSlugs = new URLSearchParams(window.location.search).get('technologies')
  const uniqueSlugs: string[] = []
  const unknownSlugs: string[] = []
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

    if (findTechnologyBySlug(slug)) uniqueSlugs.push(slug)
    else unknownSlugs.push(slug)
  }

  const slugs = uniqueSlugs.slice(0, maxComparisonTechnologies)
  return {
    slugs,
    unknownSlugs,
    duplicateCount,
    truncatedCount: Math.max(0, uniqueSlugs.length - slugs.length),
  }
}

export default function useComparisonSelection() {
  const [selection, setSelection] = useState(readSelectionFromUrl)
  const selectedTechnologies = selection.slugs.flatMap((slug) => {
    const technology = findTechnologyBySlug(slug)
    return technology ? [technology] : []
  })

  useEffect(() => {
    function handlePopState() {
      setSelection(readSelectionFromUrl())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function commitSelection(slugs: string[]) {
    const uniqueSlugs = [...new Set(slugs)]
      .filter((slug) => findTechnologyBySlug(slug))
      .slice(0, maxComparisonTechnologies)
    const nextUrl = new URL(window.location.href)

    if (uniqueSlugs.length > 0) nextUrl.searchParams.set('technologies', uniqueSlugs.join(','))
    else nextUrl.searchParams.delete('technologies')

    window.history.pushState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
    setSelection({ slugs: uniqueSlugs, unknownSlugs: [], duplicateCount: 0, truncatedCount: 0 })
  }

  function addTechnology(slug: string) {
    if (selection.slugs.includes(slug) || selection.slugs.length >= maxComparisonTechnologies) return
    commitSelection([...selection.slugs, slug])
  }

  function removeTechnology(slug: string) {
    commitSelection(selection.slugs.filter((selectedSlug) => selectedSlug !== slug))
  }

  function clearSelection() {
    commitSelection([])
  }

  return {
    selection,
    selectedTechnologies,
    availableTechnologies: technologies,
    addTechnology,
    removeTechnology,
    clearSelection,
  }
}

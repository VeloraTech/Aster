import { useEffect, useState } from 'react'
import TechnologyNotFoundPage from './TechnologyNotFoundPage'
import TechnologyDetailPage from './TechnologyDetailPage'
import { ApiRequestError, fetchTechnology, fetchTechnologyRelationships } from '../../lib/api/client'
import type { ResolvedTechnologyRelationship, Technology } from '../../types/technology'

type TechnologyRouteState =
  | { key: string; status: 'not-found' }
  | { key: string; status: 'error' }
  | { key: string; status: 'ready'; technology: Technology; relationships: ResolvedTechnologyRelationship[]; relationshipError: boolean }

export default function TechnologyRoutePage({ slug }: { slug: string }) {
  const [state, setState] = useState<TechnologyRouteState>()
  const [retry, setRetry] = useState(0)
  const requestKey = `${slug}:${retry}`

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      const [technologyResult, relationshipsResult] = await Promise.allSettled([
        fetchTechnology(slug, controller.signal),
        fetchTechnologyRelationships(slug, controller.signal),
      ])
      if (controller.signal.aborted) return

      if (technologyResult.status === 'rejected') {
        setState({
          key: requestKey,
          status: technologyResult.reason instanceof ApiRequestError && technologyResult.reason.status === 404
            ? 'not-found'
            : 'error',
        })
        return
      }

      setState({
        key: requestKey,
        status: 'ready',
        technology: technologyResult.value,
        relationships: relationshipsResult.status === 'fulfilled' ? relationshipsResult.value.relationships : [],
        relationshipError: relationshipsResult.status === 'rejected',
      })
    }

    void load()
    return () => controller.abort()
  }, [slug, retry, requestKey])

  const currentState = state?.key === requestKey ? state : undefined

  if (!currentState) {
    return <section className="technology-request-state" role="status"><p>Loading technology…</p></section>
  }
  if (currentState.status === 'not-found') return <TechnologyNotFoundPage />
  if (currentState.status === 'error') {
    return (
      <section className="technology-request-state" aria-labelledby="technology-load-error-title">
        <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Technology profile</p>
        <h1 id="technology-load-error-title">Unable to load this technology.</h1>
        <p>The technology service could not be reached. Please try again.</p>
        <div className="technology-request-actions">
          <button className="button-primary" type="button" onClick={() => setRetry((current) => current + 1)}>Try again</button>
          <a href="/explore">Back to Explore</a>
        </div>
      </section>
    )
  }

  return (
    <TechnologyDetailPage
      technology={currentState.technology}
      relationships={currentState.relationships}
      relationshipError={currentState.relationshipError}
    />
  )
}

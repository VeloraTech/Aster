import { Analytics } from '@vercel/analytics/react'

import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import { findTechnologyBySlug } from '../data/technologies'
import ExplorePage from '../features/explore/ExplorePage'
import TechnologyDetailPage from '../features/technology/TechnologyDetailPage'
import TechnologyNotFoundPage from '../features/technology/TechnologyNotFoundPage'
import HomePage from '../pages/HomePage'

import './app.css'

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const technologyMatch = path.match(/^\/(?:technologies|technology)\/(.+)$/)
  const technologySlug = technologyMatch?.[1]
  const selectedTechnology = technologySlug ? findTechnologyBySlug(technologySlug) : undefined
  const currentPage = path === '/explore'
    ? 'explore'
    : technologyMatch
      ? 'technology'
      : 'home'

  return (
    <div className="site-frame">
      <Analytics />
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader currentPage={currentPage} />
      <main id="main-content" tabIndex={-1}>
        {technologyMatch ? (
          selectedTechnology ? <TechnologyDetailPage technology={selectedTechnology} /> : <TechnologyNotFoundPage />
        ) : path === '/explore' ? (
          <ExplorePage />
        ) : (
          <HomePage />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

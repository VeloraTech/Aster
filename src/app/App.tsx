import { Analytics } from '@vercel/analytics/react'

import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import ExplorePage from '../features/explore/ExplorePage'
import TechnologyNotFoundPage from '../features/technology/TechnologyNotFoundPage'
import TechnologyRoutePage from '../features/technology/TechnologyRoutePage'
import ComparePage from '../features/compare/ComparePage'
import EcosystemPage from '../features/ecosystem/EcosystemPage'
import HomePage from '../pages/HomePage'

import './app.css'

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const technologyMatch = path.match(/^\/(?:technologies|technology)\/(.+)$/)
  const technologySlug = technologyMatch?.[1]
  const currentPage = path === '/explore'
    ? 'explore'
    : path === '/compare'
      ? 'compare'
      : path === '/ecosystem'
        ? 'ecosystem'
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
          technologySlug ? <TechnologyRoutePage slug={technologySlug} /> : <TechnologyNotFoundPage />
        ) : path === '/explore' ? (
          <ExplorePage />
        ) : path === '/compare' ? (
          <ComparePage />
        ) : path === '/ecosystem' ? (
          <EcosystemPage />
        ) : (
          <HomePage />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

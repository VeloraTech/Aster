import { Analytics } from "@vercel/analytics/next"

import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import { technologies } from '../features/explore/data/technologies'
import ExplorePage from '../features/explore/ExplorePage'
import TechnologyPlaceholderPage from '../features/explore/TechnologyPlaceholderPage'
import HomePage from '../pages/HomePage'

import './app.css'

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const technologySlug = path.startsWith('/technology/')
    ? path.slice('/technology/'.length)
    : null
  const selectedTechnology = technologySlug
    ? technologies.find((technology) => technology.slug === technologySlug)
    : undefined
  const currentPage = path === '/explore'
    ? 'explore'
    : technologySlug
      ? 'technology'
      : 'home'

  return (
    <div className="site-frame">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader currentPage={currentPage} />
      <main id="main-content" tabIndex={-1}>
        {technologySlug ? (
          <TechnologyPlaceholderPage technology={selectedTechnology} />
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

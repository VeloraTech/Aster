import SiteFooter from '../components/SiteFooter'
import SiteHeader from '../components/SiteHeader'
import ExplorePage from '../pages/ExplorePage'
import HomePage from '../pages/HomePage'
import './app.css'

export default function App() {
  const isExplorePage = window.location.pathname.replace(/\/$/, '') === '/explore'

  return (
    <div className="site-frame">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader isExplorePage={isExplorePage} />
      <main id="main-content" tabIndex={-1}>
        {isExplorePage ? <ExplorePage /> : <HomePage />}
      </main>
      <SiteFooter />
    </div>
  )
}

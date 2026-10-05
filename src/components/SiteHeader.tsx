type SiteHeaderProps = {
  currentPage: 'home' | 'explore' | 'technology' | 'compare' | 'ecosystem'
}

export default function SiteHeader({ currentPage }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="/" aria-label="Aster home">
          aster<span aria-hidden="true">.</span>
        </a>

        <nav className="primary-nav" aria-label="Primary navigation">
          {currentPage === 'home' ? (
            <a className="nav-link" href="#approach">
              The approach
            </a>
          ) : (
            <a className="nav-link" href="/">
              Introduction
            </a>
          )}
          {currentPage === 'explore' ? (
            <span className="nav-action is-current" aria-current="page">
              Explore
            </span>
          ) : (
            <a className="nav-action" href="/explore">
              Explore
            </a>
          )}
          {currentPage === 'compare' ? (
            <span className="nav-link nav-compare" aria-current="page">
              Compare
            </span>
          ) : (
            <a className="nav-link nav-compare" href="/compare">
              Compare
            </a>
          )}
          {currentPage === 'ecosystem' ? (
            <span className="nav-link nav-ecosystem" aria-current="page">
              Ecosystem
            </span>
          ) : (
            <a className="nav-link nav-ecosystem" href="/ecosystem">
              Ecosystem
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}

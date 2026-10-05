type SiteHeaderProps = {
  currentPage: 'home' | 'explore' | 'technology'
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
        </nav>
      </div>
    </header>
  )
}

type SiteHeaderProps = {
  isExplorePage: boolean
}

export default function SiteHeader({ isExplorePage }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="/" aria-label="Aster home">
          aster<span aria-hidden="true">.</span>
        </a>

        <nav className="primary-nav" aria-label="Primary navigation">
          {isExplorePage ? (
            <a className="nav-link" href="/">
              Introduction
            </a>
          ) : (
            <a className="nav-link" href="#approach">
              The approach
            </a>
          )}
          {isExplorePage ? (
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

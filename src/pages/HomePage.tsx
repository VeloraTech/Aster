export default function HomePage() {
  return (
    <>
      <section className="intro-section" aria-labelledby="intro-title">
        <div className="intro-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            Technology intelligence &amp; discovery
          </p>
          <h1 id="intro-title">
            Know the tool.
            <br />
            <span>See where it fits.</span>
          </h1>
          <p className="intro-description">
            Aster helps you understand what a technology does, what it connects
            to, and where to explore next.
          </p>
          <div className="intro-actions">
            <a className="button-primary" href="/explore">
              Explore Aster <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link" href="#approach">
              Get to know the idea
            </a>
          </div>
          <p className="development-note">
            Aster is taking shape. The exploration experience is in development.
          </p>
        </div>

        <figure className="ecosystem-figure" aria-labelledby="map-caption">
          <div className="ecosystem-map">
            <svg
              className="map-connections"
              viewBox="0 0 520 440"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <path d="M260 220 C260 166 260 120 260 70" />
              <path d="M260 220 C202 210 151 199 84 190" />
              <path d="M260 220 C320 206 373 199 437 190" />
              <path d="M260 220 C260 274 260 320 260 370" />
              <path className="connection-secondary" d="M84 190 C125 103 185 65 260 70" />
              <path className="connection-secondary" d="M437 190 C395 292 334 354 260 370" />
              <circle cx="260" cy="220" r="5" />
              <circle cx="260" cy="70" r="4" />
              <circle cx="84" cy="190" r="4" />
              <circle cx="437" cy="190" r="4" />
              <circle cx="260" cy="370" r="4" />
            </svg>
            <div className="map-orbit orbit-top">Purpose</div>
            <div className="map-orbit orbit-left">Use cases</div>
            <div className="map-orbit orbit-right">Related tools</div>
            <div className="map-orbit orbit-bottom">Alternatives</div>
            <div className="map-core">Technology</div>
          </div>
          <figcaption id="map-caption">
            One technology opens onto a wider context.
          </figcaption>
        </figure>
      </section>

      <section className="approach-section" id="approach" aria-labelledby="approach-title">
        <div className="approach-heading">
          <p className="eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            A more connected view
          </p>
          <h2 id="approach-title">A technology is only the beginning.</h2>
        </div>
        <div className="approach-body">
          <p>
            Knowing a name is useful. Understanding its role, its companions,
            and its alternatives gives you the bigger picture.
          </p>
          <a className="text-link" href="/explore">
            Start with Explore <span aria-hidden="true">↗</span>
          </a>
        </div>
        <ol className="concept-sequence" aria-label="Aster's approach to technology discovery">
          <li className="concept-item">
            <span className="concept-mark" aria-hidden="true" />
            <h3>Technology</h3>
            <p>Begin with a tool or idea.</p>
          </li>
          <li className="concept-item">
            <span className="concept-mark" aria-hidden="true" />
            <h3>Context</h3>
            <p>Understand its place and purpose.</p>
          </li>
          <li className="concept-item">
            <span className="concept-mark" aria-hidden="true" />
            <h3>Relationships</h3>
            <p>Follow what it connects to.</p>
          </li>
          <li className="concept-item">
            <span className="concept-mark" aria-hidden="true" />
            <h3>Discovery</h3>
            <p>Find what to explore next.</p>
          </li>
        </ol>
      </section>
    </>
  )
}

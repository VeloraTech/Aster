import type { Technology } from '../../types/technology'

type TechnologyPlaceholderPageProps = {
  technology?: Technology
}

export default function TechnologyPlaceholderPage({
  technology,
}: TechnologyPlaceholderPageProps) {
  return (
    <section className="placeholder-page" aria-labelledby="technology-placeholder-title">
      <p className="eyebrow">
        <span className="eyebrow-line" aria-hidden="true" />
        Technology overview
      </p>
      <h1 id="technology-placeholder-title">
        {technology ? `${technology.name} overview is coming later.` : 'Technology not found.'}
      </h1>
      <p>
        {technology
          ? 'The catalogue entry is available, but its full technology overview has not been built yet.'
          : 'This address does not match a technology in the current seed collection.'}
      </p>
      <a className="button-primary" href="/explore">
        Back to Explore
      </a>
    </section>
  )
}

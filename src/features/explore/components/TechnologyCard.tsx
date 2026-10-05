import type { TechnologySummary } from '../../../types/technology'

type TechnologyCardProps = {
  technology: TechnologySummary
}

export default function TechnologyCard({ technology }: TechnologyCardProps) {
  return (
    <article className="technology-card" aria-labelledby={`technology-${technology.id}`}>
      <div className="technology-card-meta">
        <span>{technology.category}</span>
        <span className="technology-card-type">{technology.type}</span>
      </div>
      <h2 className="technology-card-title" id={`technology-${technology.id}`}>
        {technology.name}
      </h2>
      <p className="technology-card-description">{technology.description}</p>
      {technology.ecosystem && (
        <p className="technology-card-ecosystem">
          <span>Ecosystem</span> {technology.ecosystem}
        </p>
      )}
      <a
        className="technology-card-link"
        href={`/technologies/${technology.slug}`}
        aria-label={`View the ${technology.name} overview`}
      >
        View overview <span aria-hidden="true">↗</span>
      </a>
    </article>
  )
}

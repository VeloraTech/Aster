import type { Technology } from '../../../types/technology'

type TechnologyRelationSectionProps = {
  id: string
  title: string
  technologies: Technology[]
  emptyMessage?: string
}

export default function TechnologyRelationSection({
  id,
  title,
  technologies,
  emptyMessage,
}: TechnologyRelationSectionProps) {
  return (
    <section className="detail-section relation-section" aria-labelledby={id}>
      <div className="detail-section-heading">
        <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Explore next</p>
        <h2 id={id}>{title}</h2>
      </div>
      {technologies.length > 0 ? (
        <ul className="relation-list">
          {technologies.map((technology) => (
            <li key={technology.slug}>
              <a href={`/technologies/${technology.slug}`}>
                <span className="relation-name">{technology.name}</span>
                <span className="relation-description">{technology.description}</span>
                <span className="relation-type">{technology.category} · {technology.type}</span>
                <span className="relation-arrow" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="detail-empty-state">{emptyMessage ?? 'No entries are connected here yet.'}</p>
      )}
    </section>
  )
}

import type { TechnologyResource } from '../../../types/technology'

type TechnologyResourcesProps = {
  resources: TechnologyResource[]
}

export default function TechnologyResources({ resources }: TechnologyResourcesProps) {
  if (resources.length === 0) return null

  return (
    <section className="detail-section resources-section" aria-labelledby="technology-resources-title">
      <div className="detail-section-heading">
        <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Go deeper</p>
        <h2 id="technology-resources-title">Resources</h2>
      </div>
      <ul className="resource-list">
        {resources.map((resource) => (
          <li key={`${resource.url}-${resource.label}`}>
            <a href={resource.url} target="_blank" rel="noopener noreferrer"
              aria-label={`${resource.label} (opens in a new tab)`}>
              <span>{resource.label}</span>
              <span className="resource-type">{resource.type}</span>
              <span className="relation-arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

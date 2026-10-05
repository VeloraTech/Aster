import type { Technology } from '../../types/technology'
import TechnologyRelationSection from './components/TechnologyRelationSection'
import TechnologyResources from './components/TechnologyResources'
import { resolveTechnologyReferences } from '../../data/technologies'

type TechnologyDetailPageProps = {
  technology: Technology
}

export default function TechnologyDetailPage({ technology }: TechnologyDetailPageProps) {
  const related = resolveTechnologyReferences(technology.relatedTechnologies, technology.slug)
  const alternatives = resolveTechnologyReferences(technology.alternatives, technology.slug)

  return (
    <article className="technology-detail" aria-labelledby="technology-detail-title">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <a href="/explore"><span aria-hidden="true">←</span> Explore</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{technology.name}</span>
      </nav>

      <header className="technology-detail-header">
        <div className="technology-identity">
          <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />{technology.category} · {technology.type}</p>
          <h1
            className={technology.name.length > 25 ? 'technology-detail-title-long' : undefined}
            id="technology-detail-title"
          >
            {technology.name.split('.').map((segment, index, segments) => (
              <span key={`${technology.slug}-name-${index}`}>
                {segment}{index < segments.length - 1 && <>{'.'}<wbr /></>}
              </span>
            ))}
          </h1>
          <p className="technology-detail-description">{technology.description}</p>
          <a className="technology-compare-link" href={`/compare?technologies=${encodeURIComponent(technology.slug)}`}>
            Compare with… <span aria-hidden="true">↗</span>
          </a>
        </div>
        <aside className="technology-placement" aria-labelledby="technology-placement-title">
          <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Context</p>
          <h2 id="technology-placement-title">Where it fits</h2>
          <ol className="placement-sequence">
            <li><span>Category</span>{technology.category}</li>
            <li><span>Ecosystem</span>{technology.ecosystem ?? 'Not specified in this collection'}</li>
          </ol>
        </aside>
      </header>

      <div className="technology-detail-content">
        <div className="detail-primary-column">
          <section className="detail-section about-section" aria-labelledby="technology-about-title">
            <div className="detail-section-heading">
              <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Overview</p>
              <h2 id="technology-about-title">About this technology</h2>
            </div>
            <p className="detail-context">
              {technology.context ?? `${technology.name} is listed as a ${technology.type.toLowerCase()} in ${technology.category.toLowerCase()}.`}
            </p>
            <dl className="technology-facts">
              <div><dt>Type</dt><dd>{technology.type}</dd></div>
              <div><dt>Category</dt><dd>{technology.category}</dd></div>
              {technology.ecosystem && <div><dt>Ecosystem</dt><dd>{technology.ecosystem}</dd></div>}
            </dl>
          </section>

          <section className="detail-section use-cases-section" aria-labelledby="technology-use-cases-title">
            <div className="detail-section-heading">
              <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />In practice</p>
              <h2 id="technology-use-cases-title">Commonly used for</h2>
            </div>
            {technology.useCases?.length ? (
              <ul className="use-case-list">
                {technology.useCases.map((useCase, index) => (
                  <li key={`${technology.slug}-use-${index}`}>{useCase}</li>
                ))}
              </ul>
            ) : (
              <p className="detail-empty-state">Use cases have not been added to this collection yet.</p>
            )}
          </section>
        </div>

        <div className="detail-secondary-column">
          <TechnologyRelationSection
            id="related-technologies-title"
            title="Related technologies"
            technologies={related}
            emptyMessage="No related technologies are connected to this entry yet."
          />
          {technology.alternatives !== undefined && (
            <TechnologyRelationSection
              id="technology-alternatives-title"
              title="Alternatives"
              technologies={alternatives}
              emptyMessage="No alternatives are listed for this technology yet."
            />
          )}
          <TechnologyResources resources={technology.resources ?? []} />
        </div>
      </div>
    </article>
  )
}

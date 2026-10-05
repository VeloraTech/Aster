import { relationshipDefinitions, type ResolvedTechnologyRelationship, type Technology } from '../../../types/technology'

type ComparisonAttribute = 'type' | 'category' | 'ecosystem' | 'description' | 'useCases' | 'relationships'

const attributes: { key: ComparisonAttribute; label: string }[] = [
  { key: 'type', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'ecosystem', label: 'Ecosystem' },
  { key: 'description', label: 'Description' },
  { key: 'useCases', label: 'Common use cases' },
  { key: 'relationships', label: 'Relationships' },
]

function valueFor(technology: Technology, attribute: ComparisonAttribute, relationships: ResolvedTechnologyRelationship[]) {
  switch (attribute) {
    case 'type':
      return technology.type
    case 'category':
      return technology.category
    case 'ecosystem':
      return technology.ecosystem ?? ''
    case 'description':
      return technology.description
    case 'useCases':
      return technology.useCases?.join('|') ?? ''
    case 'relationships':
      return relationships
        .map(({ type, technology: target }) => `${type}:${target.slug}`).sort().join('|')
  }
}

function ComparisonValue({ technology, attribute, relationships }: {
  technology: Technology
  attribute: ComparisonAttribute
  relationships: ResolvedTechnologyRelationship[]
}) {
  if (attribute === 'type') return <span>{technology.type}</span>
  if (attribute === 'category') return <span>{technology.category}</span>
  if (attribute === 'ecosystem') return technology.ecosystem ? <span>{technology.ecosystem}</span> : <span className="comparison-not-listed">Not listed</span>

  if (attribute === 'description') {
    if (technology.description.length <= 180) return <p className="comparison-description">{technology.description}</p>
    const summary = `${technology.description.slice(0, 125).trimEnd()}… Read full description`
    return (
      <details className="comparison-long-description">
        <summary>{summary}</summary>
        <p>{technology.description}</p>
      </details>
    )
  }

  if (attribute === 'useCases') {
    return technology.useCases?.length ? (
      <ul className="comparison-value-list">
        {technology.useCases.map((useCase, index) => <li key={`${technology.slug}-comparison-use-${index}`}>{useCase}</li>)}
      </ul>
    ) : <span className="comparison-not-listed">Not listed</span>
  }

  return relationships.length ? (
    <ul className="comparison-link-list">
      {relationships.map(({ type, technology: relatedTechnology, direction }) => (
        <li key={`${type}-${direction}-${relatedTechnology.slug}`}>
          <a href={`/technologies/${relatedTechnology.slug}`}>{relatedTechnology.name}</a>
          <small>{direction === 'outgoing' ? relationshipDefinitions[type].label : relationshipDefinitions[type].inverseLabel}</small>
        </li>
      ))}
    </ul>
  ) : <span className="comparison-not-listed">Not listed</span>
}

type ComparisonTableProps = {
  technologies: Technology[]
  relationshipsByTechnology: Record<string, ResolvedTechnologyRelationship[]>
}

export default function ComparisonTable({ technologies, relationshipsByTechnology }: ComparisonTableProps) {
  return (
    <section className="comparison-results" aria-labelledby="comparison-results-title">
      <div className="comparison-results-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Side by side</p>
          <h2 id="comparison-results-title">Compare the details</h2>
        </div>
        <p>Differences are highlighted for scanning. No scores or rankings are used.</p>
      </div>
      <div className="comparison-scroll-region" role="region" aria-label="Technology comparison table" tabIndex={0}>
        <table className="comparison-table">
          <caption className="visually-hidden">
            Descriptive comparison of {technologies.map((technology) => technology.name).join(', ')}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="comparison-attribute-heading">Attribute</th>
              {technologies.map((technology) => (
                <th scope="col" key={technology.slug}>
                  <a className="comparison-technology-heading" href={`/technologies/${technology.slug}`}>
                    <span>{technology.name}</span>
                    <small>{technology.category} · {technology.type}</small>
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map(({ key, label }) => {
              const values = technologies.map((technology) => valueFor(
                technology,
                key,
                relationshipsByTechnology[technology.slug] ?? [],
              ))
              const differs = values.some((value) => value !== values[0])

              return (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  {technologies.map((technology) => (
                    <td
                      className={differs ? 'comparison-cell comparison-cell-different' : 'comparison-cell comparison-cell-shared'}
                      key={technology.slug}
                    >
                      {differs && <span className="visually-hidden">Differs across the selected technologies. </span>}
                      <ComparisonValue
                        technology={technology}
                        attribute={key}
                        relationships={relationshipsByTechnology[technology.slug] ?? []}
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

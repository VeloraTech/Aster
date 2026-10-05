import { relationshipDefinitions, relationshipTypes, type RelationshipType, type ResolvedTechnologyRelationship } from '../../../types/technology'

type TechnologyRelationSectionProps = {
  id: string
  relationships: ResolvedTechnologyRelationship[]
  errorMessage?: string
  visibleTypes?: RelationshipType[]
}

export default function TechnologyRelationSection({
  id,
  relationships,
  errorMessage,
  visibleTypes,
}: TechnologyRelationSectionProps) {
  const types = visibleTypes ?? relationshipTypes
  const directionalTypes = new Set<RelationshipType>(['built_on', 'part_of'])
  const groups = types.flatMap((type) => {
    const directions: Array<ResolvedTechnologyRelationship['direction'] | undefined> = directionalTypes.has(type)
      ? ['outgoing', 'incoming']
      : [undefined]
    return directions.map((direction) => ({
      type,
      direction,
      label: direction === 'incoming' ? relationshipDefinitions[type].inverseLabel : relationshipDefinitions[type].label,
      items: relationships.filter((relationship) => relationship.type === type && (!direction || relationship.direction === direction)),
    })).filter((group) => group.items.length > 0)
  })

  return (
    <section className="detail-section relation-section" aria-labelledby={id}>
      <div className="detail-section-heading">
        <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Explore next</p>
        <h2 id={id}>Technology relationships</h2>
        <p className="relationship-intro">Connections are grouped by what they mean, so alternatives stay distinct from tools commonly used together.</p>
      </div>
      {groups.length > 0 ? (
        <div className="relationship-groups">
          {groups.map(({ type, direction, label, items }) => (
            <section className="relationship-group" key={`${type}-${direction ?? 'symmetric'}`} aria-labelledby={`${id}-${type}-${direction ?? 'all'}`}>
              <h3 id={`${id}-${type}-${direction ?? 'all'}`}>{label}</h3>
              <p>{relationshipDefinitions[type].description}</p>
              <ul className="relation-list">
                {items.map(({ technology, direction }) => (
                  <li key={`${type}-${technology.id}`}>
                    <a href={`/technologies/${technology.slug}`}>
                      <span className="relationship-connector" aria-hidden="true">{direction === 'outgoing' ? '→' : '←'}</span>
                      <span className="relation-name">{technology.name}</span>
                      <span className="relation-description">{direction === 'outgoing' ? relationshipDefinitions[type].label : relationshipDefinitions[type].inverseLabel}</span>
                      <span className="relation-type">{technology.category} · {technology.type}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="detail-empty-state" role={errorMessage ? 'status' : undefined}>
          {errorMessage ?? 'No ecosystem relationships yet. This technology does not currently have relationship data in Aster.'}
        </p>
      )}
    </section>
  )
}

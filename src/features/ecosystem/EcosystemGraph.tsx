import { relationshipDefinitions } from '../../types/technology'
import type { TechnologySummary } from '../../types/technology'
import { buildEcosystemGraph } from './buildEcosystemGraph'

type EcosystemGraphProps = {
  focusedTechnology: TechnologySummary
  relationships: Parameters<typeof buildEcosystemGraph>[1]
  onSelectTechnology: (slug: string) => void
  error?: boolean
  emptyMessage?: string
}

const directionalTypes = new Set(['built_on', 'part_of'])

export default function EcosystemGraph({
  focusedTechnology,
  relationships,
  onSelectTechnology,
  error = false,
  emptyMessage = 'No direct relationships are available to map for this technology yet.',
}: EcosystemGraphProps) {
  const graph = buildEcosystemGraph(focusedTechnology, relationships)
  const nodesById = new Map(graph.nodes.map((node) => [node.technology.id, node]))

  return (
    <section className="ecosystem-relationship-map" aria-labelledby="ecosystem-map-title">
      <div className="ecosystem-map-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />Visual exploration</p>
          <h2 id="ecosystem-map-title">Relationship map</h2>
        </div>
        <p>Labels explain each connection. Arrows show direction where the relationship has one.</p>
      </div>

      {error ? (
        <p className="ecosystem-map-empty" role="status">The relationship map is unavailable right now.</p>
      ) : graph.edges.length === 0 ? (
        <p className="ecosystem-map-empty" role="status">{emptyMessage}</p>
      ) : (
        <div className="ecosystem-map-scroll" tabIndex={0} aria-label="Scrollable technology relationship map">
          <div className="ecosystem-graph-canvas" style={{ height: graph.height }}>
            <svg
              className="ecosystem-graph-edges"
              viewBox={`0 0 ${graph.width} ${graph.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <marker id="ecosystem-map-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 8 4 L 0 8 z" />
                </marker>
              </defs>
              {graph.edges.map((edge, index) => {
                const source = nodesById.get(edge.sourceId)
                const target = nodesById.get(edge.targetId)
                if (!source || !target) return null
                const parallelOffset = (edge.parallelIndex - (edge.parallelCount - 1) / 2) * 32
                const middleX = (source.x + target.x) / 2
                const middleY = (source.y + target.y) / 2 + parallelOffset
                const labelWidth = Math.min(156, Math.max(102, edge.label.length * 7 + 24))
                const directional = directionalTypes.has(edge.type)
                return (
                  <g key={`${edge.targetId}-${edge.type}-${index}`}>
                    <path
                      className={`ecosystem-graph-edge${directional ? ' is-directional' : ''}`}
                      d={`M ${source.x} ${source.y} Q ${middleX} ${middleY} ${target.x} ${target.y}`}
                      markerEnd={directional ? 'url(#ecosystem-map-arrow)' : undefined}
                    />
                    <rect className="ecosystem-graph-edge-label-bg" x={middleX - labelWidth / 2} y={middleY - 13} width={labelWidth} height="26" rx="3" />
                    <text className="ecosystem-graph-edge-label" x={middleX} y={middleY + 4} textAnchor="middle">{edge.label}</text>
                  </g>
                )
              })}
            </svg>

            {graph.nodes.map(({ technology, x, y, focused }) => {
              const labels = graph.edges
                .filter((edge) => edge.targetId === technology.id)
                .map((edge) => edge.direction === 'incoming'
                  ? relationshipDefinitions[edge.type].inverseLabel.toLowerCase()
                  : relationshipDefinitions[edge.type].label.toLowerCase())
                .join(', ')
              return (
                <div
                  className={`ecosystem-graph-node${focused ? ' is-focused' : ''}`}
                  key={technology.id}
                  style={{ left: `${(x / graph.width) * 100}%`, top: `${(y / graph.height) * 100}%` }}
                >
                  {focused ? (
                    <div className="ecosystem-graph-node-body" role="group" aria-label={`Current technology: ${technology.name}`}>
                      <span className="ecosystem-graph-node-name">{technology.name}</span>
                      <span className="ecosystem-graph-node-meta">Current focus</span>
                    </div>
                  ) : (
                    <button
                      className="ecosystem-graph-node-body"
                      type="button"
                      aria-label={`${technology.name}. ${labels} ${technology.category} ${technology.type}. Select to explore its ecosystem.`}
                      title={`Explore ${technology.name}`}
                      onClick={() => onSelectTechnology(technology.slug)}
                    >
                      <span className="ecosystem-graph-node-name">{technology.name}</span>
                      <span className="ecosystem-graph-node-meta">{technology.category} · {technology.type}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

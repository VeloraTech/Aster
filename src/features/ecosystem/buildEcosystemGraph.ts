import { relationshipDefinitions, type RelationshipType, type ResolvedTechnologyRelationship, type TechnologySummary } from '../../types/technology.js'

export type EcosystemGraphNode = {
  technology: TechnologySummary
  x: number
  y: number
  focused: boolean
}

export type EcosystemGraphEdge = {
  sourceId: string
  targetId: string
  type: RelationshipType
  direction: ResolvedTechnologyRelationship['direction']
  label: string
  parallelIndex: number
  parallelCount: number
}

export type EcosystemGraph = {
  width: number
  height: number
  nodes: EcosystemGraphNode[]
  edges: EcosystemGraphEdge[]
}

const width = 1000
const focusX = width / 2
const sideInset = 145

export function buildEcosystemGraph(
  focusedTechnology: TechnologySummary,
  relationships: readonly ResolvedTechnologyRelationship[],
): EcosystemGraph {
  const validRelationships = relationships.filter(({ technology }) =>
    Boolean(technology?.id && technology.id !== focusedTechnology.id && technology.name && technology.slug),
  )
  const uniqueTechnologies = [...new Map(validRelationships.map(({ technology }) => [technology.id, technology])).values()]
  const rows = Math.max(1, Math.ceil(uniqueTechnologies.length / 2))
  const height = Math.max(440, rows * 116 + 104)
  const rowSpacing = rows === 1 ? 0 : (height - 120) / (rows - 1)
  const nodes: EcosystemGraphNode[] = [{ technology: focusedTechnology, x: focusX, y: height / 2, focused: true }]

  uniqueTechnologies.forEach((technology, index) => {
    const side = index % 2 === 0 ? 1 : -1
    const row = Math.floor(index / 2)
    nodes.push({
      technology,
      x: side > 0 ? width - sideInset : sideInset,
      y: rows === 1 ? height / 2 : 60 + row * rowSpacing,
      focused: false,
    })
  })

  const pairs = new Map<string, number>()
  const pairCounts = new Map<string, number>()
  for (const relationship of validRelationships) {
    pairCounts.set(relationship.technology.id, (pairCounts.get(relationship.technology.id) ?? 0) + 1)
  }

  const edges = validRelationships.map((relationship) => {
    const targetId = relationship.technology.id
    const parallelIndex = pairs.get(targetId) ?? 0
    pairs.set(targetId, parallelIndex + 1)
    return {
      sourceId: focusedTechnology.id,
      targetId,
      type: relationship.type,
      direction: relationship.direction,
      label: relationship.direction === 'incoming'
        ? relationshipDefinitions[relationship.type].inverseLabel
        : relationshipDefinitions[relationship.type].label,
      parallelIndex,
      parallelCount: pairCounts.get(targetId) ?? 1,
    }
  })

  return { width, height, nodes, edges }
}

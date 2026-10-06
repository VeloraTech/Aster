import assert from 'node:assert/strict'
import test from 'node:test'
import { buildEcosystemGraph } from '../../src/features/ecosystem/buildEcosystemGraph.js'
import type { ResolvedTechnologyRelationship, TechnologySummary } from '../../src/types/technology.js'

function technology(id: string, category: TechnologySummary['category'] = 'Frameworks'): TechnologySummary {
  return {
    id,
    name: id === 'typescript' ? 'TypeScript' : id.charAt(0).toUpperCase() + id.slice(1),
    slug: id,
    description: `${id} description`,
    type: id === 'typescript' ? 'Programming language' : 'Framework',
    category,
  }
}

function relationship(
  targetId: string,
  type: ResolvedTechnologyRelationship['type'],
  direction: ResolvedTechnologyRelationship['direction'] = 'outgoing',
): ResolvedTechnologyRelationship {
  return { type, direction, technology: technology(targetId) }
}

test('graph makes the selected technology central and preserves edge types and direction labels', () => {
  const react = technology('react')
  const graph = buildEcosystemGraph(react, [
    relationship('vue', 'alternative_to'),
    relationship('typescript', 'commonly_used_with'),
    relationship('react', 'related_to'),
    relationship('nextjs', 'built_on', 'incoming'),
  ])

  assert.equal(graph.nodes[0]?.technology.id, 'react')
  assert.equal(graph.nodes[0]?.focused, true)
  assert.deepEqual(graph.nodes.map(({ technology: item }) => item.id), ['react', 'vue', 'typescript', 'nextjs'])
  assert.deepEqual(graph.edges.map(({ type }) => type), ['alternative_to', 'commonly_used_with', 'built_on'])
  assert.equal(graph.edges[2]?.direction, 'incoming')
  assert.equal(graph.edges[2]?.label, 'Foundation for')
  assert.ok(graph.edges.every(({ sourceId }) => sourceId === 'react'))
})

test('graph layout handles few and many relationships without overlapping node positions', () => {
  const root = technology('react')
  const few = buildEcosystemGraph(root, [relationship('vue', 'alternative_to')])
  const many = buildEcosystemGraph(root, Array.from({ length: 9 }, (_, index) => relationship(`technology-${index}`, 'related_to')))

  assert.equal(few.nodes.length, 2)
  assert.equal(few.height, 440)
  assert.equal(many.nodes.length, 10)
  assert.ok(many.height > few.height)
  assert.equal(new Set(many.nodes.map(({ x, y }) => `${x},${y}`)).size, many.nodes.length)
})

test('unresolvable and duplicate relationship targets are safely omitted or represented once', () => {
  const root = technology('react')
  const missing = { type: 'related_to', direction: 'outgoing', technology: undefined } as unknown as ResolvedTechnologyRelationship
  const graph = buildEcosystemGraph(root, [
    relationship('typescript', 'commonly_used_with'),
    relationship('typescript', 'related_to'),
    missing,
  ])

  assert.deepEqual(graph.nodes.map(({ technology: item }) => item.id), ['react', 'typescript'])
  assert.equal(graph.edges.length, 2)
  assert.deepEqual(graph.edges.map(({ type }) => type), ['commonly_used_with', 'related_to'])
  assert.equal(graph.edges[0]?.parallelCount, 2)
  assert.equal(buildEcosystemGraph(root, []).edges.length, 0)
})

test('selecting another technology can refocus the model without changing its supplied relationships', () => {
  const react = technology('react')
  const vue = technology('vue')
  const firstView = buildEcosystemGraph(react, [relationship('vue', 'alternative_to')])
  const nextView = buildEcosystemGraph(vue, [relationship('react', 'alternative_to')])

  assert.equal(firstView.nodes.find(({ technology: item }) => item.id === 'vue')?.focused, false)
  assert.equal(nextView.nodes[0]?.technology.id, 'vue')
  assert.equal(nextView.nodes[0]?.focused, true)
  assert.equal(nextView.edges[0]?.targetId, 'react')
})

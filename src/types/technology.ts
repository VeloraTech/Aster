export const technologyTypes = [
  'Programming language',
  'Framework',
  'Runtime',
  'Database',
  'Container tool',
  'Container platform',
  'Build tool',
  'Testing tool',
  'Library',
] as const

export type TechnologyType = (typeof technologyTypes)[number]

export const technologyCategories = [
  'Languages',
  'Frameworks',
  'Libraries',
  'Databases',
  'Runtimes',
  'Infrastructure',
  'DevOps',
  'Build Tools',
  'Testing',
] as const

export type TechnologyCategory = (typeof technologyCategories)[number]

export const relationshipTypes = [
  'alternative_to',
  'commonly_used_with',
  'built_on',
  'part_of',
  'related_to',
] as const

export type RelationshipType = (typeof relationshipTypes)[number]

export type TechnologyRelationship = {
  type: RelationshipType
  targetId: string
}

export const relationshipDefinitions: Record<RelationshipType, { label: string; inverseLabel: string; description: string }> = {
  alternative_to: { label: 'Alternative to', inverseLabel: 'Alternative to', description: 'A different technology that can serve a similar role.' },
  commonly_used_with: { label: 'Commonly used with', inverseLabel: 'Commonly used with', description: 'Technologies often used together in an application or workflow.' },
  built_on: { label: 'Built on', inverseLabel: 'Foundation for', description: 'A technology this entry builds on or fundamentally depends upon.' },
  part_of: { label: 'Part of', inverseLabel: 'Includes', description: 'A technology this entry belongs to as part of a broader ecosystem.' },
  related_to: { label: 'Related to', inverseLabel: 'Related to', description: 'A meaningful connection without a more specific relationship type.' },
}

export type Technology = {
  id: string
  name: string
  slug: string
  description: string
  type: TechnologyType
  category: TechnologyCategory
  ecosystem?: string
  logo?: string
  context?: string
  useCases?: string[]
  relationships?: TechnologyRelationship[]
  resources?: TechnologyResource[]
}

export type TechnologyResource = {
  label: string
  url: string
  type: 'Official website' | 'Documentation' | 'Source code'
}

export type TechnologySummary = Pick<Technology, 'id' | 'name' | 'slug' | 'description' | 'type' | 'category' | 'ecosystem' | 'logo'>

export type ResolvedTechnologyRelationship = {
  type: RelationshipType
  technology: TechnologySummary
  direction: 'outgoing' | 'incoming'
}

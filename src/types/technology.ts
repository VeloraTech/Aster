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

export type Technology = {
  id: string
  name: string
  slug: string
  description: string
  type: TechnologyType
  category: TechnologyCategory
  ecosystem?: string
  logo?: string
}

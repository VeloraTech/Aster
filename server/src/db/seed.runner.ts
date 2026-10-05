import type { Pool } from 'pg'
import type { RelationshipType } from '../types/technology.js'
import { seedTechnologies } from './seed-data.js'

export function validateSeed() {
  const ids = new Set(seedTechnologies.map((technology) => technology.id))
  const symmetricTypes = new Set<RelationshipType>(['alternative_to', 'commonly_used_with', 'related_to'])
  const edges = new Set<string>()

  for (const technology of seedTechnologies) {
    for (const relationship of technology.relationships ?? []) {
      if (!ids.has(relationship.targetId)) {
        throw new Error(`Seed relationship from ${technology.id} points to missing target ${relationship.targetId}.`)
      }
      const pair = symmetricTypes.has(relationship.type)
        ? [technology.id, relationship.targetId].sort().join(':')
        : `${technology.id}:${relationship.targetId}`
      const key = `${relationship.type}:${pair}`
      if (edges.has(key)) throw new Error(`Duplicate seed relationship: ${key}.`)
      edges.add(key)
    }
  }
}

export async function seedDatabase(pool: Pool) {
  validateSeed()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const ids = seedTechnologies.map((technology) => technology.id)
    await client.query('DELETE FROM technologies WHERE NOT (id = ANY($1::text[]))', [ids])

    for (const technology of seedTechnologies) {
      await client.query(
        `INSERT INTO technologies(id, name, slug, description, type, category, ecosystem, logo, context)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           type = EXCLUDED.type,
           category = EXCLUDED.category,
           ecosystem = EXCLUDED.ecosystem,
           logo = EXCLUDED.logo,
           context = EXCLUDED.context,
           updated_at = now()`,
        [technology.id, technology.name, technology.slug, technology.description,
          technology.type, technology.category, technology.ecosystem ?? null,
          technology.logo ?? null, technology.context ?? null],
      )
    }

    await client.query('DELETE FROM technology_relationships')
    await client.query('DELETE FROM technology_use_cases')
    await client.query('DELETE FROM technology_resources')

    for (const technology of seedTechnologies) {
      for (const [position, useCase] of (technology.useCases ?? []).entries()) {
        await client.query(
          'INSERT INTO technology_use_cases(technology_id, position, use_case) VALUES($1, $2, $3)',
          [technology.id, position, useCase],
        )
      }
      for (const [position, resource] of (technology.resources ?? []).entries()) {
        await client.query(
          'INSERT INTO technology_resources(technology_id, position, label, url, type) VALUES($1, $2, $3, $4, $5)',
          [technology.id, position, resource.label, resource.url, resource.type],
        )
      }
      for (const relationship of technology.relationships ?? []) {
        await client.query(
          `INSERT INTO technology_relationships(source_technology_id, relationship_type, target_technology_id)
           VALUES($1, $2, $3)`,
          [technology.id, relationship.type, relationship.targetId],
        )
      }
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

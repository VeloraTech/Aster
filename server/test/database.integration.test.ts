import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import pg from 'pg'
import { runMigrations } from '../src/db/migration.runner.js'
import { seedDatabase } from '../src/db/seed.runner.js'
import { TechnologyModel } from '../src/models/technology.model.js'

const { Pool } = pg
const connectionString = process.env.DATABASE_URL_TEST

function hasPgCode(error: unknown, code: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code
}

test('PostgreSQL migration, seed, and integrity constraints', { skip: !connectionString && 'Set DATABASE_URL_TEST to run against Supabase in an isolated temporary schema.' }, async () => {
  if (!connectionString) return
  const schema = `aster_test_${randomUUID().replaceAll('-', '')}`
  const adminPool = new Pool({ connectionString, max: 1 })
  let isolatedPool: pg.Pool | undefined

  try {
    await adminPool.query(`CREATE SCHEMA ${schema}`)
    isolatedPool = new Pool({ connectionString, max: 1, options: `-c search_path=${schema}` })
    await runMigrations(isolatedPool)
    await seedDatabase(isolatedPool)
    await seedDatabase(isolatedPool)

    const model = new TechnologyModel(isolatedPool)
    const list = await model.list({ sort: 'name', order: 'asc', page: 1, limit: 100 })
    assert.equal(list.pagination.total, 19)
    assert.ok(list.filters.categories.includes('Frameworks'))

    const react = await model.findBySlug('react')
    assert.equal(react?.name, 'React')
    assert.ok(react?.useCases.length)
    assert.ok(react?.resources.length)

    const reactRelationships = await model.findRelationships('react')
    assert.ok(reactRelationships?.relationships.alternative_to.some(({ technology }) => technology.slug === 'vue'))
    assert.ok(reactRelationships?.relationships.commonly_used_with.some(({ technology }) => technology.slug === 'typescript'))

    const noRelationships = await model.findRelationships('microsoft-extensions-dependency-injection')
    assert.ok(noRelationships)
    assert.equal(Object.values(noRelationships.relationships).flat().length, 0)

    await assert.rejects(
      isolatedPool.query(
        `INSERT INTO technologies(id,name,slug,description,type,category)
         VALUES('duplicate','Duplicate','react','Duplicate row','Library','Frameworks')`,
      ),
      (error: unknown) => hasPgCode(error, '23505'),
    )
    await assert.rejects(
      isolatedPool.query(
        `INSERT INTO technology_relationships(source_technology_id,relationship_type,target_technology_id)
         VALUES('react','related_to','missing-target')`,
      ),
      (error: unknown) => hasPgCode(error, '23503'),
    )
    await assert.rejects(
      isolatedPool.query(
        `INSERT INTO technology_relationships(source_technology_id,relationship_type,target_technology_id)
         VALUES('react','commonly_used_with','typescript')`,
      ),
      (error: unknown) => hasPgCode(error, '23505'),
    )
    await assert.rejects(
      isolatedPool.query(
        `INSERT INTO technology_relationships(source_technology_id,relationship_type,target_technology_id)
         VALUES('typescript','commonly_used_with','react')`,
      ),
      (error: unknown) => hasPgCode(error, '23505'),
    )
  } finally {
    await isolatedPool?.end()
    await adminPool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`)
    await adminPool.end()
  }
})

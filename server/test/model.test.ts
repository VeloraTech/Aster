import assert from 'node:assert/strict'
import test from 'node:test'
import { buildTechnologyListQuery } from '../src/models/technology.model.js'
import { seedTechnologies } from '../src/db/seed-data.js'
import { validateSeed } from '../src/db/seed.runner.js'

test('technology list query binds search and filter values instead of interpolating user input', () => {
  const built = buildTechnologyListQuery({
    search: "react' OR 1=1 --",
    category: 'Frameworks',
    type: 'Library',
    ecosystem: 'JavaScript',
    sort: 'name',
    order: 'desc',
    page: 3,
    limit: 8,
  })

  assert.equal(built.whereSql.includes("react' OR 1=1"), false)
  assert.match(built.whereSql, /position\(\$1 in lower\(name\)\)/)
  assert.deepEqual(built.values, ["react' or 1=1 --", 'Frameworks', 'Library', 'JavaScript'])
  assert.equal(built.limit, 8)
  assert.equal(built.offset, 16)
  assert.equal(built.orderSql, 'DESC')
})

test('seed data has resolvable and non-duplicated typed relationship targets', () => {
  assert.doesNotThrow(validateSeed)
  const ids = new Set(seedTechnologies.map((technology) => technology.id))
  const missingTargets = seedTechnologies.flatMap((technology) =>
    (technology.relationships ?? []).filter((relationship) => !ids.has(relationship.targetId)),
  )
  assert.equal(missingTargets.length, 0)
  assert.equal(seedTechnologies.length, 19)
})

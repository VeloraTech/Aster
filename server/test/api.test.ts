import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from 'node:http'
import test from 'node:test'
import type { TechnologyRepository } from '../src/types/technology.js'
import { createApp } from '../src/app.js'

const react = {
  id: 'react', name: 'React', slug: 'react', description: 'A UI library.',
  type: 'Library' as const, category: 'Frameworks' as const, ecosystem: 'JavaScript',
  context: 'The interface layer.', useCases: ['Web applications'], resources: [],
  relationships: [{ type: 'commonly_used_with' as const, targetId: 'typescript' }],
}

function createRepository(overrides: Partial<TechnologyRepository> = {}) {
  let lastQuery: unknown
  const repository: TechnologyRepository = {
    list: async (query) => {
      lastQuery = query
      return {
        data: [{ id: react.id, name: react.name, slug: react.slug, description: react.description, type: react.type, category: react.category, ecosystem: react.ecosystem }],
        pagination: { page: query.page, limit: query.limit, total: 21, totalPages: 3 },
        filters: { categories: ['Frameworks', 'Languages'] },
      }
    },
    findBySlug: async (slug) => slug === 'react' ? react : null,
    findRelationships: async (slug) => slug === 'react' ? {
      technology: { id: 'react', name: 'React', slug: 'react', description: 'A UI library.', type: 'Library', category: 'Frameworks' },
      relationships: {
        alternative_to: [],
        commonly_used_with: [{ technology: { id: 'typescript', name: 'TypeScript', slug: 'typescript', description: 'A typed language.', type: 'Programming language', category: 'Languages' }, direction: 'outgoing' }],
        built_on: [],
        part_of: [],
        related_to: [],
      },
    } : null,
    listCategories: async () => ['Frameworks', 'Languages'],
    ping: async () => undefined,
    ...overrides,
  }
  return { repository, getLastQuery: () => lastQuery }
}

async function withApi(repository: TechnologyRepository, run: (baseUrl: string) => Promise<void>) {
  const server = createServer(createApp(repository, ['http://localhost:5173']))
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('The test API did not bind to a TCP port.')
  try {
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

test('health endpoint checks the repository connection', async () => {
  const { repository } = createRepository()
  await withApi(repository, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/health`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: 'ok' })
  })
})

test('technology collection validates and applies search, filters, sorting, and pagination', async () => {
  const { repository, getLastQuery } = createRepository()
  await withApi(repository, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/technologies?search=React&category=Frameworks&page=2&limit=7&sort=name&order=desc`)
    assert.equal(response.status, 200)
    const body = await response.json() as { data: { slug: string }[]; pagination: { page: number; limit: number; total: number } }
    assert.equal(body.data[0]?.slug, 'react')
    assert.deepEqual(body.pagination, { page: 2, limit: 7, total: 21, totalPages: 3 })
    assert.deepEqual(getLastQuery(), {
      search: 'React', category: 'Frameworks', type: undefined, ecosystem: undefined,
      sort: 'name', order: 'desc', page: 2, limit: 7,
    })
  })
})

test('invalid query values return a structured 400 without reaching the repository', async () => {
  let listCalled = false
  const { repository } = createRepository({ list: async () => { listCalled = true; throw new Error('should not run') } })
  await withApi(repository, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/technologies?page=0&sort=created_at`)
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), {
      error: { code: 'INVALID_QUERY_PARAMETER', message: 'The "sort" query parameter must be "name".' },
    })
    assert.equal(listCalled, false)
  })
})

test('technology detail and typed relationships use structured 404 and 200 responses', async () => {
  const { repository } = createRepository()
  await withApi(repository, async (baseUrl) => {
    const detail = await fetch(`${baseUrl}/api/v1/technologies/react`)
    assert.equal(detail.status, 200)
    assert.equal((await detail.json() as { data: typeof react }).data.name, 'React')

    const relationships = await fetch(`${baseUrl}/api/v1/technologies/react/relationships`)
    assert.equal(relationships.status, 200)
    const relationshipBody = await relationships.json() as { data: { relationships: { commonly_used_with: unknown[] } } }
    assert.equal(relationshipBody.data.relationships.commonly_used_with.length, 1)

    const missing = await fetch(`${baseUrl}/api/v1/technologies/no-such-technology`)
    assert.equal(missing.status, 404)
    assert.deepEqual(await missing.json(), { error: { code: 'TECHNOLOGY_NOT_FOUND', message: 'Technology not found.' } })
  })
})

test('database failures and unapproved origins do not expose internal details', async () => {
  const { repository } = createRepository({
    ping: async () => { throw new Error('postgres://secret-password') },
    list: async () => { throw new Error('SQL contains secret-password') },
  })
  await withApi(repository, async (baseUrl) => {
    const health = await fetch(`${baseUrl}/api/v1/health`)
    assert.equal(health.status, 503)
    assert.deepEqual(await health.json(), { error: { code: 'SERVICE_UNAVAILABLE', message: 'The technology service is unavailable.' } })

    const failed = await fetch(`${baseUrl}/api/v1/technologies`)
    assert.equal(failed.status, 500)
    assert.deepEqual(await failed.json(), { error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected server error occurred.' } })

    const blocked = await fetch(`${baseUrl}/api/v1/health`, { headers: { Origin: 'https://untrusted.example' } })
    assert.equal(blocked.status, 403)
    assert.equal(blocked.headers.get('access-control-allow-origin'), null)
  })
})

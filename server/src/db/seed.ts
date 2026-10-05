import { getDatabaseUrl } from '../config/environment.js'
import { getDatabasePool } from './pool.js'
import { seedDatabase } from './seed.runner.js'

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The seed command is restricted to non-production environments.')
  }
  getDatabaseUrl()
  const pool = getDatabasePool()
  try {
    await seedDatabase(pool)
    process.stdout.write('Seeded the Aster technology catalogue into PostgreSQL.\n')
  } finally {
    await pool.end()
  }
}

seed().catch(() => {
  process.stderr.write('Database seed failed. Run db:migrate first and check DATABASE_URL.\n')
  process.exitCode = 1
})

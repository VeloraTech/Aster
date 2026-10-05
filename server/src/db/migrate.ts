import { getDatabaseUrl } from '../config/environment.js'
import { getDatabasePool } from './pool.js'
import { runMigrations } from './migration.runner.js'

async function migrate() {
  getDatabaseUrl()
  const pool = getDatabasePool()
  try {
    await runMigrations(pool)
    process.stdout.write('Database migrations are up to date.\n')
  } finally {
    await pool.end()
  }
}

migrate().catch(() => {
  process.stderr.write('Database migration failed. Check DATABASE_URL and database permissions.\n')
  process.exitCode = 1
})

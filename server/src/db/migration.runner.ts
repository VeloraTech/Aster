import { readFile } from 'node:fs/promises'
import type { Pool } from 'pg'

const migrations = [
  { version: '001_initial', file: new URL('./migrations/001_initial.sql', import.meta.url) },
]

export async function runMigrations(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  for (const migration of migrations) {
    const alreadyApplied = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [migration.version])
    if (alreadyApplied.rowCount) continue

    const sql = await readFile(migration.file, 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations(version) VALUES($1)', [migration.version])
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

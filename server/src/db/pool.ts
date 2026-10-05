import pg from 'pg'

const { Pool } = pg

export function createDatabasePool(connectionString: string) {
  return new Pool({ connectionString, max: 5, connectionTimeoutMillis: 5_000 })
}

let sharedPool: ReturnType<typeof createDatabasePool> | undefined

export function getDatabasePool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is required. Add the connection string from Supabase Dashboard → Connect to .env.')
  }
  sharedPool ??= createDatabasePool(connectionString)
  return sharedPool
}

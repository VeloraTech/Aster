export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required. Copy .env.example to .env and add the connection string from Supabase Dashboard → Connect.')
  }
  return databaseUrl
}

export function getApiPort() {
  const value = process.env.PORT ?? process.env.API_PORT ?? '3001'
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT must be a valid TCP port number.')
  }
  return port
}

export function getApiHost() {
  return process.env.API_HOST?.trim() || '0.0.0.0'
}

export function getAllowedOrigins() {
  return (process.env.CLIENT_ORIGINS ?? 'http://127.0.0.1:5173,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

import { createServer } from 'node:http'
import { createApp } from './app.js'
import { getAllowedOrigins, getApiHost, getApiPort, getDatabaseUrl } from './config/environment.js'
import { getDatabasePool } from './db/pool.js'
import { TechnologyModel } from './models/technology.model.js'

getDatabaseUrl()
const database = getDatabasePool()
const model = new TechnologyModel(database)
const app = createApp(model, getAllowedOrigins())
const server = createServer(app)
const port = getApiPort()
const host = getApiHost()

server.listen(port, host, () => {
  process.stdout.write(`Aster API listening on http://${host}:${port}/api/v1\n`)
})

async function shutdown() {
  server.close(async () => {
    await database.end()
    process.exit(0)
  })
}

process.on('SIGINT', () => void shutdown())
process.on('SIGTERM', () => void shutdown())

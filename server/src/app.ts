import express, { type RequestHandler } from 'express'
import { ApiError, errorPayload } from './errors.js'
import { TechnologyService } from './services/technology.service.js'
import type { TechnologyRepository } from './types/technology.js'
import { createTechnologyRouter } from './routes/technology.routes.js'

function createCorsMiddleware(allowedOrigins: readonly string[]): RequestHandler {
  return (request, response, next) => {
    const origin = request.get('origin')
    if (origin && !allowedOrigins.includes(origin)) {
      next(new ApiError(403, 'ORIGIN_NOT_ALLOWED', 'This request origin is not allowed.'))
      return
    }
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin)
      response.setHeader('Vary', 'Origin')
      response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      response.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type')
      response.setHeader('Access-Control-Max-Age', '600')
    }
    if (request.method === 'OPTIONS') {
      response.sendStatus(204)
      return
    }
    next()
  }
}

export function createApp(
  repository: TechnologyRepository,
  allowedOrigins: readonly string[] = [],
) {
  const app = express()
  const service = new TechnologyService(repository)

  app.disable('x-powered-by')
  app.use(createCorsMiddleware(allowedOrigins))

  app.get('/api/v1/health', async (_request, response) => {
    try {
      await service.ping()
      response.json({ status: 'ok' })
    } catch {
      response.status(503).json(errorPayload('SERVICE_UNAVAILABLE', 'The technology service is unavailable.'))
    }
  })

  app.use('/api/v1/technologies', createTechnologyRouter(service))
  app.use('/api', (_request, _response, next) => {
    next(new ApiError(404, 'NOT_FOUND', 'API endpoint not found.'))
  })

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (response.headersSent) {
      _next(error)
      return
    }
    if (error instanceof ApiError) {
      response.status(error.status).json(errorPayload(error.code, error.message))
      return
    }
    response.status(500).json(errorPayload('INTERNAL_SERVER_ERROR', 'An unexpected server error occurred.'))
  })

  return app
}

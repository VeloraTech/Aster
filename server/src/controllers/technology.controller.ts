import type { RequestHandler } from 'express'
import { ApiError } from '../errors.js'
import { TechnologyService } from '../services/technology.service.js'

export function createTechnologyController(service: TechnologyService) {
  const list: RequestHandler = async (request, response) => {
    const result = await service.list(request.query as Record<string, unknown>)
    response.json(result)
  }

  const getBySlug: RequestHandler = async (request, response) => {
    const slug = typeof request.params.slug === 'string' ? request.params.slug : ''
    const technology = await service.getBySlug(slug)
    if (!technology) throw new ApiError(404, 'TECHNOLOGY_NOT_FOUND', 'Technology not found.')
    response.json({ data: technology })
  }

  const getRelationships: RequestHandler = async (request, response) => {
    const slug = typeof request.params.slug === 'string' ? request.params.slug : ''
    const relationships = await service.getRelationships(slug)
    if (!relationships) throw new ApiError(404, 'TECHNOLOGY_NOT_FOUND', 'Technology not found.')
    response.json({ data: relationships })
  }

  return { list, getBySlug, getRelationships }
}

import { Router } from 'express'
import { createTechnologyController } from '../controllers/technology.controller.js'
import { TechnologyService } from '../services/technology.service.js'

export function createTechnologyRouter(service: TechnologyService) {
  const router = Router()
  const controller = createTechnologyController(service)
  router.get('/', controller.list)
  router.get('/:slug/relationships', controller.getRelationships)
  router.get('/:slug', controller.getBySlug)
  return router
}

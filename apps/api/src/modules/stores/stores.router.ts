import { Router } from 'express'
import * as storesController from './stores.controller.js'

const router = Router()

router.get('/:slug', storesController.getPublicCatalog)

export default router

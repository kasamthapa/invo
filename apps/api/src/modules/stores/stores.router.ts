import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { requireOwner } from '../../middleware/requireOwner.js'
import * as storesController from './stores.controller.js'

const router = Router()

router.put('/profile', authenticate, requireOwner, storesController.updateProfile)
router.get('/:slug', storesController.getPublicCatalog)

export default router

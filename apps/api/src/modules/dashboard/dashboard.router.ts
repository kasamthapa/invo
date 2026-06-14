import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { requireOwner } from '../../middleware/requireOwner.js'
import * as dashboardController from './dashboard.controller.js'

const router = Router()

router.use(authenticate)

router.get('/summary', requireOwner, dashboardController.getSummary)
router.get('/overview', dashboardController.getStaffView)

export default router

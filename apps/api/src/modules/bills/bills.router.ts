import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import * as billsController from './bills.controller.js'

const router = Router()

// Public route — no auth (Phase 5 will expose this)
router.get('/public/:token', billsController.getBillByToken)

// Authenticated routes
router.use(authenticate)

router.post('/', billsController.createBill)
router.get('/', billsController.listBills)
router.get('/:id', billsController.getBill)
router.patch('/:id/payment', billsController.updatePayment)
router.post('/:id/void', billsController.voidBill)

export default router

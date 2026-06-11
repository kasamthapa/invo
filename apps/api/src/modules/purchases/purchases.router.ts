import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { requireOwner } from '../../middleware/requireOwner.js'
import * as purchasesController from './purchases.controller.js'

const router = Router()

router.use(authenticate, requireOwner)

router.post('/', purchasesController.createPurchase)
router.get('/', purchasesController.listPurchases)
router.get('/:id', purchasesController.getPurchase)
router.delete('/:id', purchasesController.deletePurchase)

export default router

import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { requireOwner } from '../../middleware/requireOwner.js'
import * as suppliersController from './suppliers.controller.js'

const router = Router()

router.use(authenticate, requireOwner)

router.post('/', suppliersController.createSupplier)
router.get('/', suppliersController.listSuppliers)
router.get('/:id', suppliersController.getSupplier)
router.put('/:id', suppliersController.updateSupplier)
router.delete('/:id', suppliersController.deleteSupplier)

export default router

import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import * as customersController from './customers.controller.js'

const router = Router()

router.use(authenticate)

router.get('/search', customersController.searchCustomers)
router.post('/', customersController.createCustomer)
router.get('/', customersController.listCustomers)
router.get('/:id', customersController.getCustomer)
router.put('/:id', customersController.updateCustomer)
router.delete('/:id', customersController.deleteCustomer)

export default router

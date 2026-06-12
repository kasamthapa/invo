import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { requireOwner } from '../../middleware/requireOwner.js'
import * as expensesController from './expenses.controller.js'

const router = Router()

router.use(authenticate, requireOwner)

router.post('/', expensesController.createExpense)
router.get('/', expensesController.listExpenses)
router.get('/summary', expensesController.getExpenseSummary)
router.get('/:id', expensesController.getExpense)
router.put('/:id', expensesController.updateExpense)
router.delete('/:id', expensesController.deleteExpense)

export default router

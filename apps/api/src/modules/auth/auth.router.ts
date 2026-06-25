import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import * as authController from './auth.controller.js'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.post('/change-password', authenticate, authController.changePassword)

export default router

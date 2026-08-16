import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { authRateLimiter } from '../../middleware/rateLimit.js'
import * as authController from './auth.controller.js'

const router = Router()

router.post('/register', authRateLimiter, authController.register)
router.post('/login', authRateLimiter, authController.login)
router.post('/refresh', authRateLimiter, authController.refresh)
router.post('/logout', authController.logout)
router.post('/change-password', authenticate, authController.changePassword)

export default router

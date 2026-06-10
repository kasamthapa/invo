import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { uploadMiddleware } from '../../middleware/upload.js'
import * as productsController from './products.controller.js'

const router = Router()

router.use(authenticate)

router.post('/', productsController.createProduct)
router.get('/', productsController.listProducts)
router.get('/:id', productsController.getProduct)
router.put('/:id', productsController.updateProduct)
router.delete('/:id', productsController.deleteProduct)

router.post('/:id/variants', productsController.addVariant)
router.put('/:id/variants/:variantId', productsController.updateVariant)
router.delete('/:id/variants/:variantId', productsController.deleteVariant)

router.post('/:id/images', uploadMiddleware, productsController.uploadImages)

export default router

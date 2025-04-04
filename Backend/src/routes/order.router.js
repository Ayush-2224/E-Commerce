import {Router} from 'express'
import {createOrderbyProductId, createOrderbyCartId, getOrders, cancelOrder} from '../controllers/order.controller.js'
import {verifyUserAuthentication} from '../middleware/userAuth.middleware.js'
const router = Router()

router.post('/cobpi/:productId', verifyUserAuthentication, createOrderbyProductId)
router.post('/cobci/:cartId', verifyUserAuthentication, createOrderbyCartId)
router.get('/getOrders', verifyUserAuthentication, getOrders)
router.delete('/cancelOrder/:orderId', verifyUserAuthentication, cancelOrder)

export default router


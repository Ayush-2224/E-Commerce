import {Router} from 'express'
import {createOrderbyProductId,verifyAndConfirm, createOrderbyCartId, getOrders, cancelOrder} from '../controllers/order.controller.js'
import verifyUserAuthentication from '../middleware/userAuth.middleware.js'
const router = Router()

router.post('/cobpi/:productId', verifyUserAuthentication, createOrderbyProductId)
router.post('/verify',verifyUserAuthentication,verifyAndConfirm)
router.get('/cobci', verifyUserAuthentication, createOrderbyCartId)
router.get('/getOrders', verifyUserAuthentication, getOrders)
router.post('/cancelOrder/:orderId', verifyUserAuthentication, cancelOrder)

export default router

    
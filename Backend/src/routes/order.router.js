import {Router} from 'express'
import {createOrderbyProductId,verifyAndConfirm, createOrderbyCartId, getOrders, getSellerOrders, cancelOrder} from '../controllers/order.controller.js'
import verifyUserAuthentication from '../middleware/userAuth.middleware.js'
import verifySellerAuthentication from '../middleware/sellerAuth.middleware.js'

const router = Router()

router.post('/cobpi/:productId', verifyUserAuthentication, createOrderbyProductId)
router.post('/verify',verifyUserAuthentication,verifyAndConfirm)
router.post('/cobci', verifyUserAuthentication, createOrderbyCartId)
router.get('/getOrders', verifyUserAuthentication, getOrders)
router.get('/seller-orders', verifySellerAuthentication, getSellerOrders)
router.post('/cancelOrder/:orderId', verifyUserAuthentication, cancelOrder)

export default router

    
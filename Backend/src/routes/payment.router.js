import {Router} from 'express'
import {paymentCallback, generateCashfreeToken, createPayment, Refund} from '../controllers/payment.controller.js'

const router = Router()


router.post("/payment-callback", paymentCallback);

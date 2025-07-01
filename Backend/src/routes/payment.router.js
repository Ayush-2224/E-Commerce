import {Router} from 'express'
import {paymentCallback} from '../controllers/payment.controller.js'

const router = Router()


router.post("/payment-callback", paymentCallback);

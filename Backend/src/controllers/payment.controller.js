import Payment from '../models/payment.model.js';
import Order from "../models/order.model.js"
import HttpError from '../models/http-error.js'
const createPayment = async (req, res, next) => {
    const {amount, transactionId} = req.body
    const userId = req.userData._id
    const {orderId} = req.params

    try{

        const order = Order.findById(orderId)
        if(!order){
            return next(new HttpError("Order not found", 404))
        }
        const newPayment = new Payment({
            type:"Receive",
            userId,
            orderId,
            amount,
            transactionId 
        })

        await newPayment.save()
        res.status(201).json({message: "Payment completed succesfully", newPayment})
    }catch(error){
        console.log("Payment failed: ", error)
        return next(new HttpError("Payment Failed", 500))
    }
}

const Refund = async (req, res, next) => {
    const {amount, transactionId} = req.body
    const userId = req.userData._id
    const {orderId} = req.params

    try{

        const order = Order.findById(orderId)
        if(!order){
            return next(new HttpError("Order not found", 404))
        }
        const newPayment = new Payment({
            type:"Refund",
            userId,
            orderId,
            amount,
            transactionId
        })

        await newPayment.save()
        res.status(201).json({message: "Refund completed succesfully", newPayment})
    }catch(error){
        console.log("Refund failed: ", error)
        return next(new HttpError("Refund Failed", 500))
    }
}

export  {createPayment, Refund}
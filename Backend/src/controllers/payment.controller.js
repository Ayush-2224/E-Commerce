import Payment from '../models/Payment.model.js';
import Order from "../models/order.model.js"
import HttpError from '../models/http-error.js'
import axios from 'axios'

const paymentCallback = async (req, res, next) => {
    const paymentData = req.body;
    // For example, paymentData may include orderId, referenceId, status, etc.
    // Implement your verification logic here (e.g. check the signature using your secret key)
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const signature = paymentData.signature;
    const isSignatureValid = await verifySignature(paymentData, secretKey, signature);  
    if(!isSignatureValid){
        return next(new HttpError("Invalid signature", 401))
    }
  
    try {
      // Assuming verification is successful.
      // For aggregated orders, orderId can be a comma-separated list.
      const orderIds = paymentData.orderId.split(",");
      for (const orderId of orderIds) {
        const order = await Order.findById(orderId);
        if (order) {
          order.orderStatus = "Order Placed";
          await order.save();
  
          // Deduct product quantity only after payment confirmation.
          const product = await Product.findById(order.productId);
          if (product) {
            // Here, we assume one unit per order.
            product.quantity = product.quantity - 1;
            await product.save();
          }
        }
      }
      // You may redirect the user or send a JSON response.
      res.status(200).json({ message: "Payment verified and orders confirmed", paymentData });
    } catch (error) {
      return next(new HttpError("Payment callback processing failed: " + error.message, 500));
    }
  };

  const generateCashfreeToken = async (
    orderId,
    orderAmount,
    orderCurrency = "INR",
    customerName,
    customerEmail,
   returnUrl
  ) => {
    const url = "https://test.cashfree.com/api/v2/cftoken/order";
    const data = {
      orderId,       // Can be a single order ID or comma-separated multiple order IDs
      orderAmount,   // Total order amount
      orderCurrency, // Usually "INR"
      customerName,
      customerEmail,
      returnUrl,     // URL to which Cashfree will redirect after payment
    };
    const headers = {
      "Content-Type": "application/json",
      "x-client-id": process.env.CASHFREE_CLIENT_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
    };
  
    try {
      const response = await axios.post(url, data, { headers });
      return response.data; // Expected to contain a "cftoken"
    } catch (error) {
      throw new Error(
        "Failed to generate Cashfree token: " +
          (error.response ? JSON.stringify(error.response.data) : error.message)
      );
    }
  };
  
  
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


export  {createPayment, Refund, paymentCallback, generateCashfreeToken}
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import HttpError from "../models/http-error.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import {generateCashfreeToken} from "./payment.controller.js";
import razorpay from "../lib/razorpay.js";
import crypto from 'crypto'
import Payment from "../models/Payment.model.js";
const createOrderbyProductId = async (req, res, next) => {
       const {productId} = req.params;
      

    try {
       
    const product = await Product.findById(productId);
   
    if(!product){
        return next(new HttpError("Product not found", 404));
    }

        if(product.quantity === 0){
            return next(new HttpError("Product is not available", 400))
        }
        const {price} = product;
        const razorpayOrder=await razorpay.orders.create({
          amount: price*100,
          currency: "INR",
          receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        })
        res.status(201).json({
      success: true,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      product,
      username:req.userData.username,
      email:req.userData.email,
    });
  }
  catch (error) {
    console.error("Error creating order:", error);
    return next(new HttpError("Failed to create order", 500));
  }
}

const verifyAndConfirm = async(req,res,next)=>{
  const userId = req.userData._id;
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    productId,
  } = req.body;

  

  try {
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(new HttpError("Invalid payment signature", 400));
    }

    const product = await Product.findByIdAndUpdate(productId, {
      $inc: { quantity: -1 },
    });

    const order = new Order({
      productId,
      price: product.price,
      mrp: product.mrp,
      userId,
      paymentStatus: "Paid",
      orderStatus: "Order Placed",
    });

    const payment = new Payment({
        type: "Receive",
        userId,
        orderId: order._id,
        amount: product.price,
        transactionId: razorpay_payment_id,
    });

    await order.save();
    await payment.save();
    res.status(201).json({
      success: true,
      message: "Payment verified and order created",
      order,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return next(new HttpError("Failed to confirm order", 500));
  }
 
}

// quantity is not updated here handel it
const createOrderbyCartId = async (req, res, next) => {
    const userId = req.userData._id;
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart) {
        await session.abortTransaction();
        return next(new HttpError("Cart not found", 404));
      }
  
      let orders = [];
      let totalAmount = 0;
  
      for (const cartItem of cart.products) {
        const product = await Product.findById(cartItem.productId).session(session);
        if (!product) {
          await session.abortTransaction();
          return next(new HttpError("Product not found", 404));
        }
        if (product.quantity < cartItem.quantity) {
          await session.abortTransaction();
          return next(new HttpError("Product unavailable", 400));
        }
  
        // For each cart item, create an order with status "Payment Pending"
        const order = new Order({
          productId: cartItem.productId,
          price: product.price,
          mrp: product.mrp,
          userId,
          orderStatus: "Payment Pending",
        });
        await order.save({ session });
        orders.push(order);
        totalAmount += product.price * cartItem.quantity;
        // Do not update product.quantity here.
      }
  
      
      const returnUrl = process.env.CASHFREE_RETURN_URL;
      // If multiple orders, concatenate IDs (you could also create a separate "cart order" record)
      const aggregatedOrderId = orders.map(o => o._id.toString()).join(",");
      const tokenResponse = await generateCashfreeToken(
        aggregatedOrderId,
        totalAmount,
        "INR",
        req.userData.username,
        req.userData.email,
        returnUrl
      );
      await session.commitTransaction();
      session.endSession();
  
      res.status(201).json({
        message: "Orders created. Redirect to payment.",
        orders,
        cashfreeToken: tokenResponse.cftoken,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction error:", error);
      return next(new HttpError("Failed to create orders: " + error.message, 500));
    }
  };
  

const getOrders = async (req, res, next) => {
  const userId = req.userData._id;

  try {
    const orders = await Order.find({ userId })
      .populate({
        path: "productId",
        select: "title brand imageUrl"
      })
      .lean();

    res.status(200).json({ orders });
  } catch (error) {
    return next(new HttpError("Failed to get orders", 500));
  }
};


const refund = async (transactionId) => {
  try {
    const refundData = await razorpay.payments.refund(transactionId);
    return {
      success: true,
      message: "Refund initiated",
      data: refundData,
    };
  } catch (error) {
    console.error("Refund failed:", error);
    return {
      success: false,
      message: "Refund failed",
      error,
    };
  }
};

const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new HttpError("Order not found", 404));
    }

    if (order.orderStatus === "Order Cancelled") {
      return next(new HttpError("Order already cancelled", 400));
    }

    // Check if payment was made
    const paymentInfo = await Payment.findOne({ orderId });
    if (!paymentInfo || order.paymentStatus !== "Paid") {
      // Even if not paid, we still cancel the order and update stock
      order.orderStatus = "Order Cancelled";
      await Product.findByIdAndUpdate(order.productId, { $inc: { quantity: 1 } });
      order.paymentStatus = "Cancelled";
      await order.save();
  
      return res.status(200).json({
        message: "Order cancelled successfully. No payment found, so no refund issued.",
        order,
      });
    }

    // Refund case
    const refundResult = await refund(paymentInfo.transactionId);
  
    if (!refundResult.success) {
      return next(new HttpError("Refund initiation failed", 500));
    }

    // Update stock and order status
    await Product.findByIdAndUpdate(order.productId, { $inc: { quantity: 1 } });
    order.orderStatus = "Order Cancelled";
    order.paymentStatus = "Refunded";
    await order.save();
    await Payment.updateOne({ orderId }, { $set: { paymentStatus: "Refunded" } });
    return res.status(200).json({
      message: "Order cancelled and refund initiated successfully.",
      order,
      refund: refundResult.data,
    });

  } catch (error) {
    console.error("Error cancelling order:", error);
    return next(new HttpError("Failed to cancel order", 500));
  }
};

export {createOrderbyProductId,verifyAndConfirm, createOrderbyCartId, getOrders, cancelOrder};


import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import HttpError from "../models/http-error.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { generateCashfreeToken } from "./payment.controller.js";
import razorpay from "../lib/razorpay.js";
import crypto from 'crypto'
import Payment from "../models/Payment.model.js";
const createOrderbyProductId = async (req, res, next) => {
  const { productId } = req.params;


  try {

    const product = await Product.findById(productId);

    if (!product) {
      return next(new HttpError("Product not found", 404));
    }

    if (product.quantity === 0) {
      return next(new HttpError("Product is not available", 400))
    }
    const { price } = product;
    const razorpayOrder = await confirmOrder(price);
    res.status(201).json({
      message: "Your order has been placed successfully",
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      username: req.userData.username,
      product,
      email: req.userData.email,
    });
  }
  catch (error) {
    console.error("Error creating order:", error);
    return next(new HttpError("Failed to create order", 500));
  }
}

const confirmOrder = async (price) => {
  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: price * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    });
    return razorpayOrder;
  } catch (error) {
    console.error("Error confirming order:", error);
   return new HttpError("Failed to confirm order", 500);
  }
};


const verifyAndConfirm = async (req, res, next) => {
  const userId = req.userData._id;
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    productId,
    isCartOrder = false,
  } = req.body;

  try {
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(new HttpError("Invalid payment signature", 400));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    let orders = [];
    let totalAmount = 0;

    if (isCartOrder) {
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart || cart.products.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return next(new HttpError("Cart is empty or not found", 404));
      }

      for (const cartItem of cart.products) {
        const product = await Product.findById(cartItem.productId).session(session);
        if (!product || product.quantity < cartItem.quantity) {
          await session.abortTransaction();
          session.endSession();
          return next(new HttpError(`Product unavailable: ${cartItem.productId}`, 400));
        }

        await Product.findByIdAndUpdate(product._id, {
          $inc: { quantity: -cartItem.quantity },
        }).session(session);
        console.log(cartItem.quantity, "cartItem.quantity")
        for (let i = 0; i < cartItem.quantity; i++) {
          const order = new Order({
            productId: product._id,
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

          await order.save({ session });
          await payment.save({ session });
          orders.push(order);
          totalAmount += product.price;
        }

      }

      await Cart.findOneAndUpdate({ userId }, { products: [] }).session(session);
    } else {
      const product = await Product.findById(productId).session(session);
      if (!product || product.quantity === 0) {
        await session.abortTransaction();
        session.endSession();
        return next(new HttpError("Product not available", 400));
      }

      await Product.findByIdAndUpdate(productId, {
        $inc: { quantity: -1 },
      }).session(session);

      const order = new Order({
        productId,
        price: product.price,
        mrp: product.mrp,
        userId,
        quantity: 1,
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

      await order.save({ session });
      await payment.save({ session });
      orders.push(order);
      totalAmount = product.price;
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Payment verified and orders created",
      totalAmount,
      orders,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return next(new HttpError("Failed to confirm order", 500));
  }
};


const createOrderbyCartId = async (req, res, next) => {
  const userId = req.userData._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || cart.products.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return next(new HttpError("Cart is empty or not found", 404));
    }

    let orders = [];
    let price = 0;

    for (const cartItem of cart.products) {
      const product = await Product.findById(cartItem.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return next(new HttpError(`Product not found: ${cartItem.productId}`, 404));
      }
      if (product.quantity < cartItem.quantity) {
        await session.abortTransaction();
        session.endSession();
        return next(new HttpError(`Insufficient quantity for ${product.title}`, 400));
      }

      orders.push({
        product,
        quantity: cartItem.quantity,
      });

      price += product.price * cartItem.quantity;
    }

    const razorpayOrder = await confirmOrder(price);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Your order has been placed successfully",
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      products: orders,
      username: req.userData.username,
      email: req.userData.email,
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
    const orders = await Order.find({ userId }).sort({ createdAt: -1 })
      .populate({
        path: "productId",
        select: "title brand imageUrl"
      })
      
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
    if (new Date() > order.refundLimit) {
      const err = new HttpError("Refund window expired", 403);
      err.checkRefund = false;
      return next(err);
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

export { createOrderbyProductId, verifyAndConfirm, createOrderbyCartId, getOrders, cancelOrder };


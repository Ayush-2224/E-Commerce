import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import HttpError from "../models/http-error.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import {generateCashfreeToken} from "./payment.controller.js";
const createOrderbyProductId = async (req, res, next) => {
    const userId = req.userData._id;
    const {productId} = req.params;
    const product = await Product.findById(productId);

    if(!product){
        return next(new HttpError("Product not found", 404));
    }

    const {price, mrp} = product;
    
    try {
        if(product.quantity === 0){
            return next(new HttpError("Product is not available", 400))
        }
        const order = new Order({
            productId,
            price,
            mrp,
            userId
        })
        product.quantity-= 1;
        await product.save();
        await order.save();

        const returnUrl = process.env.CASHFREE_RETURN_URL;
    const tokenResponse = await generateCashfreeToken(
      order._id.toString(),
      price,
      "INR",
      req.userData.username,  // Assuming these are populated from your authentication middleware
      req.userData.email,
      returnUrl
    );
        // order.orderStatus = "Order Placed";
        res.status(201).json({message: "Order created successfully", order,cashfreeToken: tokenResponse.cftoken, });
    }
    catch(error){
        // console.log(error);
        
        return next(new HttpError("Failed to create order", 500));
    }
}

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
  
      await session.commitTransaction();
      session.endSession();
  
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
        const orders = await Order.find({userId});
        res.status(200).json({orders});
    }
    catch(error){
        return next(new HttpError("Failed to get orders", 500));
    }
}

const cancelOrder = async (req, res, next) => {
    const {orderId} = req.params;
    try{
        const order = await Order.findById(orderId);
        if(!order){
            return next(new HttpError("Order not found", 404));
        }
        order.paymentStatus = "Cancelled";
        if(order.orderStatus == "Order Cancelled"){
            return next(new HttpError("Order already cancelled", 404));
        }
        order.orderStatus = "Order Cancelled";
        if(order.paymentStatus==="Paid"){
            // refund(req, res, next);
        }
        const product = await Product.findById(order.productId);
        product.quantity += 1;
        await product.save();
        await order.save();
        res.status(200).json({message: "Order cancelled successfully", order});
    }
    catch(error){
        return next(new HttpError("Failed to cancel order", 500));
    }
}

export {createOrderbyProductId, createOrderbyCartId, getOrders, cancelOrder};

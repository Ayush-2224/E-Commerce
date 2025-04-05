import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import HttpError from "../models/http-error.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

const createOrderbyProductId = async (req, res, next) => {
    const userId = req.userData._id;
    const {productId} = req.params;
    const product = await Product.findById(productId);

    if(!product){
        return next(new HttpError("Product not found", 404));
    }

    const {price, mrp} = product;
    
    try {
        const order = new Order({
            productId,
            price,
            mrp,
            userId
        })
        await order.save();
        // order.orderStatus = "Order Placed";
        res.status(201).json({message: "Order created successfully", order});
    }
    catch(error){
        // console.log(error);
        
        return next(new HttpError("Failed to create order", 500));
    }
}

const createOrderbyCartId = async (req, res, next) => {
    const userId = req.userData._id;
    console.log(userId);
    
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const cart = await Cart.findOne({userId});
        if(!cart){
            await session.abortTransaction();
            return next(new HttpError("Cart not found", 404));
        }
        console.log(cart)
        for (const product of cart.products) {
        console.log(product);
            
            const {price,mrp} = await Product.findById(product.productId);
            for(let i=0;i<product.quantity;i++){
                const order = new Order({
                    productId: product.productId,
                    price,
                    mrp,    
                    userId
                });
                console.log(order);
                await order.save({ session });
            }
        }

        await session.commitTransaction();
        res.status(201).json({message: "Orders created successfully"});
    }
    catch(error){
        await session.abortTransaction();
        return next(new HttpError("Failed to create order", 500));
    }finally{
        session.endSession();
    }
}

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
        await order.save();
        res.status(200).json({message: "Order cancelled successfully", order});
    }
    catch(error){
        return next(new HttpError("Failed to cancel order", 500));
    }
}

export {createOrderbyProductId, createOrderbyCartId, getOrders, cancelOrder};

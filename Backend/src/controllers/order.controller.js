import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import HttpError from "../models/http-error.js";
import Product from "../models/product.model.js";

const createOrderbyProductId = async (req, res, next) => {
    const {userId} = req.userData._id;
    const {productId} = req.params;
    const {quantity, price, mrp} = req.body;
    try {
        const order = new Order({
            userId,
            productId,
            quantity,
            price,
            mrp
        })
        await order.save();
        // order.orderStatus = "Order Placed";
        res.status(201).json({message: "Order created successfully", order});
    }
    catch(error){
        return next(new HttpError("Failed to create order", 500));
    }
}

const createOrderbyCartId = async (req, res, next) => {
    const {userId} = req.userData._id;
    const {cartId} = req.params;
    try {
        const cart = await Cart.findById(cartId);
        if(!cart){
            return next(new HttpError("Cart not found", 404));
        }
        cart.products.forEach(async (product) => {
            const {price,mrp} = await Product.findById(product.productId).select("price mrp");
            const order = new Order({
                userId,
                productId: product.productId,
                quantity: product.quantity,
                price,
                mrp,
            })
            await order.save();
        })
        res.status(201).json({message: "Orders created successfully"});
    }
    catch(error){
        return next(new HttpError("Failed to create order", 500));
    }
}

const getOrders = async (req, res, next) => {
    const {userId} = req.userData._id;
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
    try {
        const order = await Order.findById(orderId);
        if(!order){
            return next(new HttpError("Order not found", 404));
        }
        order.paymentStatus = "Cancelled";
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

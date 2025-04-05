import Cart, { productEntrySchema } from '../models/cart.model.js';
import HttpError from '../models/http-error.js';
import Product from '../models/product.model.js';

const addProductToCart = async (req, res, next) => {
    const {quantity} = req.body;
    const {productId} = req.params;
    const userId = req.userData._id;
    try {
        const cart = await Cart.findOne({userId});
        if(!cart){
            return next(new HttpError("Cart not found", 404));
        }
        const product = await Product.findById(productId);
        if(!product){
            return next(new HttpError("Product not found", 404));
        }
        if(product.quantity<quantity){
            return next(new HttpError("Quantity not available", 404));
        }
        const productEntry = {
            productId,
            quantity
        };
        cart.products.push(productEntry);
        await cart.save();
        res.status(200).json({message: "Product added to cart", cart});        

    } catch (error) {
        return next(new HttpError("Failed to add product to cart", 500));
    }
}

const getCart = async (req, res, next) => {
    const userId = req.userData._id;
    try {
        const cart = await Cart.findOne({userId});
        res.status(200).json({cart});
    } catch (error) {
        return next(new HttpError("Failed to get cart", 500));
    }
}

const removeProductFromCart = async (req, res, next) => {
    const {productId} = req.params;
    const userId = req.userData._id;
    try {
        const cart = await Cart.findOne({userId});
        
        cart.products=cart.products.filter(p=>p.productId.toString() !== productId);
        await cart.save();
        res.status(200).json({message: "Product removed from cart", cart});
    } catch (error) {
        return next(new HttpError("Failed to remove product from cart", 500));
    }
}

const changeQuantityFromCart =async(req,res,next)=>{
    const {productId} = req.params;
    const {quantity}=req.body;
    const userId = req.userData._id;
    try {
        const cart = await Cart.findOne({userId});
        
        const product = cart.products.find(
            (element) => element.productId.toString() === productId
          );
          if(!product){
            return next(new HttpError("Product not found", 404));
          }
          product.quantity=quantity;
          await cart.save();
        res.status(200).json({message: "Product quantity changed", cart});
    } catch (error) {
        return next(new HttpError("Failed to change quantity of  product ", 500));
    }
}


export {addProductToCart,getCart,removeProductFromCart,changeQuantityFromCart}
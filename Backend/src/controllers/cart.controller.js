import Cart, { productEntrySchema } from '../models/cart.model.js';
import HttpError from '../models/http-error.js';
import Product from '../models/product.model.js';

async function fetfetchCartWithDetails(userId) {
        const cart = await Cart.findOne({ userId })
  .populate({
    path: "products.productId",
    select: "imageUrl title price mrp seller",
    populate: {
      path: "seller",
      select: "username"
    }
  });
  
  if (cart && Array.isArray(cart.products)) {
      cart.products = cart.products.map(entry => {
          if (entry.productId && Array.isArray(entry.productId.imageUrl)) {
              entry.productId.imageUrl = entry.productId.imageUrl[0];
            }
            return entry;
        });
    }

    return cart;
}

const getProducts = async (req, res, next) => {
    const products = req.body.products; // Expecting an array of product IDs
    if (!Array.isArray(products) || products.length === 0) {        
        return next(new HttpError("Invalid product list", 400));
    }

    try{
        let cart = { products: [] };
        for(const item of products){
            const productId = item.id;
            let product = await Product.findById(productId).populate("seller", "username");
            if(!product){
                continue; // Skip if product not found
            }
           
            cart.products.push({
                productId: product,
                quantity: item.qty || 1 // Default quantity to 1 if not provided
            });
        }
        res.status(200).json({message: "Products fetched successfully", cart});
    }catch (error) {
        console.log(error);
        
        return next(new HttpError("Failed to fetch products", 500));
    }
}

const addProductToCart = async (req, res, next) => {
    const { quantity = 1 } = req.body;
    const {productId} = req.params;
    console.log("Adding product to cart:", productId, "Quantity:", quantity);
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

const checkProductinCart = async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.userData._id;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(201).json({ message: "Cart does not exist" });
        }

        const productExists = cart.products.some(
            item => item.productId.toString() === productId
        );

        if (!productExists) {
            return res.status(201).json({ message: "Product is not in cart" });
        }

        res.status(200).json({ message: "Product is already in cart" });

    } catch (error) {
        return next(new HttpError("Failed to check product in cart", 500));
    }
};


const getCart = async (req, res, next) => {
    const userId = req.userData._id;
    try {
        const cart = await fetfetchCartWithDetails(userId)
    console.log(cart);
        res.status(200).json(cart);
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

        const updatedCart = await fetfetchCartWithDetails(userId)
        console.log(updatedCart);
        
        res.status(200).json({message: "Product removed from cart", cart:updatedCart});
    } catch (error) {
        return next(new HttpError("Failed to remove product from cart", 500));
    }
}

const changeQuantityFromCart =async(req,res,next)=>{
    const {productId} = req.params;
    const {quantity}=req.body;
    const userId = req.userData._id;
    console.log(productId);
    
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
        
          const updatedCart = await fetfetchCartWithDetails(userId)
          console.log(updatedCart);
          
          res.status(200).json({
            message: "Quantity updated successfully",
            cart: updatedCart
          });
    } catch (error) {
        console.log(error);
        return next(new HttpError("Failed to change quantity of  product ", 500));
    }
}


export {addProductToCart,getCart,removeProductFromCart,changeQuantityFromCart, checkProductinCart, getProducts}
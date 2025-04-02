import Product from '../models/product.model.js'
import HttpError from '../models/http-error.js'
import cloudinary from '../lib/cloudinary.js'

const addProduct = async (req, res, next) => {
    try {
        const {
            title,
            category,
            price,
            mrp,
            specifications,
            quantity
        } = req.body;

        // Validate required fields
        if (!title || !category || !price || !quantity) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        // Validate category
        const validCategories = ["Electronics", "Appliances", "Mobiles", "Toys", "Books", "Food", "Furniture", "Medicines"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        // Get seller ID from authenticated seller
        const seller = req.sellerData._id;

        // Handle image upload to Cloudinary
        let imageUrl = [];
        if (req.file) {
            try {
                const uploadResult = await cloudinary.uploader.upload(req.file.path);
                imageUrl.push(uploadResult.secure_url);
            } catch (error) {
                console.log("Image upload error:", error);
                return res.status(400).json({ message: "Failed to upload image" });
            }
        }

        // Create new product
        const newProduct = new Product({
            title,
            category,
            imageUrl,
            price: Number(price),
            mrp: Number(mrp) || Number(price), // If mrp not provided, use price as mrp
            specifications: specifications || "",
            seller,
            quantity: Number(quantity)
        });

        // Save product
        const savedProduct = await newProduct.save();
        
        if (!savedProduct) {
            return res.status(500).json({ message: "Failed to create product" });
        }

        return res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });

    } catch (error) {
        console.log("addProduct error:", error);
        return next(new HttpError("Internal Server Error", 500));
    }
}

const getProductById = async (req,res,next)=>{
    try {
        const {id}=req.params
        const product=await Product.findById(id)
        if(!product){
            return next(new HttpError("Product not found",404))
        }
        return res.status(200).json({product})
    } catch (error) {
        
    }
}
const getProductsByCategory = async (req,res,next)=>{
    try {
        const {category}=req.params
        const products=await Product.find({category})
        if(!products){
            return next(new HttpError("Products not found",404))
        }
        return res.status(200).json({products})
    } catch (error) {
        
    }
}

const editProduct = async (req,res,next)=>{
    try {
        const {id}=req.params
        const {price,quantity}=req.body
        const product=await Product.findByIdAndUpdate(id,{title,category,price,mrp,specifications,quantity})
        if(!product){
            return next(new HttpError("Product not found",404))
        }
        return res.status(200).json({product})
    } catch (error) {
        
    }
}

// const deleteProduct = async (req,res,next)=>{
//     try {
//         const {id}=req.params
//         const product=await Product.findByIdAndDelete(id)
//         if(!product){
//             return next(new HttpError("Product not found",404))
//         }
//         return res.status(200).json({message:"Product deleted successfully"})
//     } catch (error) {
//         return next(new HttpError("Internal Server Error",500))
//     }
// }

const getProductsBySeller = async (req,res,next)=>{
    try {
        const seller=req.sellerData._id
        const products=await Product.find({seller})
        if(!products){
            return next(new HttpError("Products not found",404))
        }
        return res.status(200).json({products})
    } catch (error) {
        return next(new HttpError("Internal Server Error",500))
    }
}   
export { addProduct, getProductById, getProductsByCategory, editProduct, getProductsBySeller };

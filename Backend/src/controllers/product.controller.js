import Product from '../models/product.model.js'
import HttpError from '../models/http-error.js'
import cloudinary, { uploadToCloudinary } from '../lib/cloudinary.js'
import { json } from 'express';

const addProduct = async (req, res, next) => {
    try {
        const {
            brand,
            title,
            category,
            price,
            mrp,
            specifications,
            quantity,
            description
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
        if(req.files && req.files.mainImages){
            for(const file of req.files.mainImages){
                try{
                    const uploadResult = await uploadToCloudinary(file.buffer)
                    imageUrl.push(uploadResult.secure_url)
                }catch(error){
                    console.log("Main image upload error", error);
                    return next(new HttpError("Failed to upload main images", 400))
                }
            }
        }

        let parsedDescription = []
        try{
            parsedDescription = JSON.parse(description)
        }catch(error){
            return next(new HttpError("Invalid description format", 400))
        }
        const descriptionFiles = req.files && req.files.descriptionImages ? req.files.descriptionImages: []
        let fileIndex = 0
        for(const element of parsedDescription){
            if(element.type === "image"){
                if(descriptionFiles[fileIndex]){
                    try{
                        const uploadResult = await uploadToCloudinary(descriptionFiles[fileIndex].buffer)
                        element.data = uploadResult.secure_url
                        fileIndex++
                    }catch(error){
                        console.log("Description image upload error:", error);
                        return next(new HttpError("Failed to upload one of the description images", 400))
                    }
                }else{
                    return next(new HttpError("Missing image files", 400))
                }
            }
        }

        // Create new product
        const newProduct = new Product({
            brand,
            title,
            category,
            imageUrl,   
            price: Number(price),
            mrp: Number(mrp) || Number(price), // If mrp not provided, use price as mrp
            description: parsedDescription,
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
        return next(new HttpError("Internal Server Error",500))
    }
}

// change to filter
const getProductsByCategory = async (req,res,next)=>{
    try {
        const {category}=req.params
        const products=await Product.find({category})
        if(!products){
            return next(new HttpError("Products not found",404))
        }
        return res.status(200).json({products})
    } catch (error) {
        return next(new HttpError("Internal Server Error",500))
    }
}

const editProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const seller = req.sellerData._id;
        const { price, quantity, description } = req.body;

        // Find product by id and seller
        const product = await Product.findById(id);
        if (!product) {
            return next(new HttpError("Product not found", 404));
        }
        if(product.seller != seller){
            return next(new HttpError("Unauthorized", 400))
        }

        // Update basic fields
        if (price !== undefined) product.price = price;
        if (quantity !== undefined) product.quantity = quantity;

        // Optional: Replace main images if provided
        if (req.files && req.files.mainImages) {
            let imageUrl = [];
            for (const file of req.files.mainImages) {
                try {
                    const uploadResult = await uploadToCloudinary(file.buffer);
                    imageUrl.push(uploadResult.secure_url);
                } catch (error) {
                    console.log("Main image upload error", error);
                    return next(new HttpError("Failed to upload main images", 400));
                }
            }
            product.imageUrl = imageUrl; // update main images
        }

        // Optional: Replace description and associated images
        if (description) {
            let parsedDescription = [];
            try {
                parsedDescription = JSON.parse(description);
            } catch (error) {
                return next(new HttpError("Invalid description format", 400));
            }

            const descriptionFiles = req.files && req.files.descriptionImages ? req.files.descriptionImages: []
            let fileIndex = 0;

            for (const element of parsedDescription) {
                if (element.type === "image") {
                    if (descriptionFiles[fileIndex]) {
                        try {
                            const uploadResult = await uploadToCloudinary(descriptionFiles[fileIndex].buffer);
                            element.data = uploadResult.secure_url;
                            fileIndex++;
                        } catch (error) {
                            console.log("Description image upload error:", error);
                            return next(new HttpError("Failed to upload one of the description images", 400));
                        }   
                    } else {
                        return next(new HttpError("Missing image files for description", 400));
                    }
                }
            }

            product.description = parsedDescription; // update description
        }

        // Save updated product
        const updatedProduct = await product.save();
        return res.status(200).json({ product: updatedProduct });

    } catch (error) {
        console.log("Edit product error:", error);
        return next(new HttpError("Internal Server Error", 500));
    }
};


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

export const searchProducts = async (req, res, next) => {
  const query = req.query.q;


  if (!query) {
    return next(new HttpError('Search query is required.', 400));
  }

  try {
    const results = await Product.aggregate([
      {
        $search: {
          index: 'default',
          text: {
            query,
            path: ['title', 'category'], // Include other string fields as needed
            fuzzy: {
              maxEdits: 2,
              prefixLength: 1,
              maxExpansions: 50,
            },
          },
        },
      },
      {
        $limit: 10,
      },
    ]);

    return res.status(200).json(results);
  } catch (error) {
    console.error('Search Error:', error);
    return next(new HttpError('Internal Server Error', 500));
  }
};


export { addProduct, getProductById, getProductsByCategory, editProduct, getProductsBySeller,searchProducts };

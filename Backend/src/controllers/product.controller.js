import Product from '../models/product.model.js'
import HttpError from '../models/http-error.js'
import cloudinary from '../lib/cloudinary.js'

const addProduct = async (req, res, next) => {
    try {
        const {
            title,
            category,
            image,
            price,
            mrp,
            description,
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
        if (image) {
            try {
                const uploadResult = await cloudinary.uploader.upload(image);
                imageUrl.push(uploadResult.secure_url);
            } catch (error) {
                console.log("Image upload error:", error);
                return res.status(400).json({ message: "Failed to upload image" });
            }
        }

        // Process description elements if provided
        let processedDescription = [];
        if (description && Array.isArray(description)) {
            processedDescription = await Promise.all(description.map(async (element) => {
                if (element.type === "image" && element.data) {
                    // Upload image to cloudinary if it's a base64 string
                    const uploadResult = await cloudinary.uploader.upload(element.data);
                    return {
                        type: "image",
                        data: uploadResult.secure_url
                    };
                }
                return element;
            }));
        }

        // Create new product
        const newProduct = new Product({
            title,
            category,
            imageUrl,
            price,
            mrp: mrp || price, // If mrp not provided, use price as mrp
            description: processedDescription,
            specifications: specifications || "",
            seller,
            quantity
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

export { addProduct };

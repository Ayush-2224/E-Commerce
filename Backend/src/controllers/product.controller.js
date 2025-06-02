import Product from '../models/product.model.js'
import HttpError from '../models/http-error.js'
import cloudinary, { uploadToCloudinary } from '../lib/cloudinary.js'
import { json } from 'express';

const addProduct = async (req, res, next) => {
    try {
        console.log("Adding product with data:", req.body);
        console.log("Files received:", req.files);
        
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

        if (!brand || !title || !category || !price || !quantity) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        const validCategories = ["Electronics", "Appliances", "Mobiles", "Toys", "Books", "Food", "Furniture", "Medicines"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const seller = req.sellerData._id;

        // Handle main images
        let imageUrl = [];
        if (req.files && req.files.mainImages) {
            for (const file of req.files.mainImages) {
                try {
                    const uploadResult = await uploadToCloudinary(file.buffer);
                    imageUrl.push(uploadResult.secure_url);
                } catch (error) {
                    return next(new HttpError("Failed to upload main images", 400));
                }
            }
        }

        // Handle description - simplified approach
        let parsedDescription = [];
        try {
            if (description) {
                const rawDescription = typeof description === "string" ? JSON.parse(description) : description;
                
                // Handle description images
                const descriptionFiles = req.files && req.files.descriptionImages ? req.files.descriptionImages : [];
                
                // Process text descriptions
                for (const element of rawDescription) {
                    parsedDescription.push({
                        heading: element.heading || "",
                        text: element.text || "",
                        image: ""
                    });
                }
                
                // Add description images as separate elements
                for (const file of descriptionFiles) {
                    try {
                        const uploadResult = await uploadToCloudinary(file.buffer);
                        parsedDescription.push({
                            heading: "",
                            text: "",
                            image: uploadResult.secure_url
                        });
                    } catch (error) {
                        return next(new HttpError("Failed to upload description image", 400));
                    }
                }
            }
        } catch (error) {
            console.error("Description parsing error:", error);
            return next(new HttpError("Invalid description format", 400));
        }

        // Handle specifications - convert flat array to grouped format
        let parsedSpecifications = [];
        try {
            if (specifications) {
                const rawSpecs = typeof specifications === "string" ? JSON.parse(specifications) : specifications;
                
                if (Array.isArray(rawSpecs) && rawSpecs.length > 0) {
                    // Group all specifications under a single heading
                    parsedSpecifications = [{
                        heading: "Product Specifications",
                        specs: rawSpecs.filter(spec => spec.key && spec.value) // Filter out empty specs
                    }];
                }
            }
        } catch (error) {
            console.error("Specifications parsing error:", error);
            return next(new HttpError("Invalid specifications format", 400));
        }

        const newProduct = new Product({
            brand,
            title,
            category,
            imageUrl,
            price: Number(price),
            mrp: Number(mrp) || Number(price),
            description: parsedDescription,
            specifications: parsedSpecifications,
            seller,
            quantity: Number(quantity)
        });

        console.log("Product before save:", newProduct);

        const savedProduct = await newProduct.save();

        if (!savedProduct) {
            return res.status(500).json({ message: "Failed to create product" });
        }

        return res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });

    } catch (error) {
        console.error("Add product error:", error);
        return next(new HttpError("Internal Server Error", 500));
    }
};

const getProductById = async (req,res,next)=>{
    try {
        const {id}=req.params
        console.log(id)
        const product=await Product.findById(id)
        console.log(product)
        if(!product){
            return next(new HttpError("Product not found",404))
        }
        
        return res.status(200).json(product)
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
        return res.status(200).json(products)
    } catch (error) {
        return next(new HttpError("Internal Server Error",500))
    }
}

const editProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seller = req.sellerData._id;

    const product = await Product.findOne({ _id: id, seller });
    if (!product) {
      return res.status(404).json({ message: "Product not found or not authorized" });
    }

    const {
      category,
      price,
      mrp,
      specifications,
      quantity,
      description
    } = req.body;

    if (!category || !price || !quantity) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const validCategories = ["Electronics", "Appliances", "Mobiles", "Toys", "Books", "Food", "Furniture", "Medicines"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    // Handle main images - only update if new images are provided
    let imageUrl = product.imageUrl;
    if (req.files && req.files.mainImages && req.files.mainImages.length > 0) {
      imageUrl = [];
      for (const file of req.files.mainImages) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer);
          imageUrl.push(uploadResult.secure_url);
        } catch (error) {
          return next(new HttpError("Failed to upload main images", 400));
        }
      }
    }

    // Handle description with images
    let parsedDescription = product.description || [];
    try {
      if (description) {
        const rawDescription = typeof description === "string" ? JSON.parse(description) : description;
        const descriptionFiles = req.files && req.files.descriptionImages ? req.files.descriptionImages : [];
        
        parsedDescription = [];
        let imageIndex = 0;
        
        for (const element of rawDescription) {
          const descItem = {
            heading: element.heading || "",
            text: element.text || "",
            image: element.image || "" // Keep existing image if provided
          };
          
          // If this description item needs a new image
          if (element.needsNewImage && imageIndex < descriptionFiles.length) {
            try {
              const uploadResult = await uploadToCloudinary(descriptionFiles[imageIndex].buffer);
              descItem.image = uploadResult.secure_url;
              imageIndex++;
            } catch (error) {
              return next(new HttpError("Failed to upload description image", 400));
            }
          }
          
          parsedDescription.push(descItem);
        }
        
        // Handle any remaining new images that weren't matched to description items
        while (imageIndex < descriptionFiles.length) {
          try {
            const uploadResult = await uploadToCloudinary(descriptionFiles[imageIndex].buffer);
            parsedDescription.push({
              heading: "",
              text: "",
              image: uploadResult.secure_url
            });
            imageIndex++;
          } catch (error) {
            return next(new HttpError("Failed to upload description image", 400));
          }
        }
      }
    } catch (error) {
      console.error("Description parsing error:", error);
      return next(new HttpError("Invalid description format", 400));
    }

    // Handle specifications
    let parsedSpecifications = product.specifications || [];
    try {
      if (specifications) {
        const rawSpecs = typeof specifications === "string" ? JSON.parse(specifications) : specifications;
        if (Array.isArray(rawSpecs) && rawSpecs.length > 0) {
          parsedSpecifications = [{
            heading: "Product Specifications",
            specs: rawSpecs.filter(spec => spec.key && spec.value)
          }];
        } else {
          parsedSpecifications = [];
        }
      }
    } catch (error) {
      console.error("Specifications parsing error:", error);
      return next(new HttpError("Invalid specifications format", 400));
    }

    // Update product fields (excluding title and brand)
    product.category = category;
    product.price = Number(price);
    product.mrp = Number(mrp) || Number(price);
    product.quantity = Number(quantity);
    product.imageUrl = imageUrl;
    product.description = parsedDescription;
    product.specifications = parsedSpecifications;

    const savedProduct = await product.save();

    if (!savedProduct) {
      return res.status(500).json({ message: "Failed to update product" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: savedProduct
    });

  } catch (error) {
    console.error("Edit product error:", error);
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
            return null;
        }
        return res.status(200).json({products})
    } catch (error) {
        console.log(error)
        return next(new HttpError("Internal Server Error",500))
    }
}   

const searchProducts = async (req, res, next) => {
  const query = req.query.q;
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;

  if (!query) {
    return next(new HttpError("Search query is required.", 400));
  }

  try {
    //
    // 1) Build a compound $search stage:
    //    – A “phrase” clause (highest boost) for exact‐order matches
    //    – A “text” clause on title (with moderate fuzziness + a boost)
    //    – A “text” clause on category (with lighter fuzziness + smaller boost)
    //
    // 2) Extract the searchScore into a “score” field
    // 3) Sort by score descending
    // 4) Skip/limit for pagination
    //
    let results = await Product.aggregate([
      {
        $search: {
          index: "default",
          compound: {
            should: [
              {
                phrase: {
                  query: query,
                  path: "title",
                  slop: 1,
                  score: { boost: { value: 5 } }
                }
              },
              {
                text: {
                  query: query,
                  path: "title",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2
                  },
                  score: { boost: { value: 2 } }
                }
              },
              {
                text: {
                  query: query,
                  path: "category",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 3
                  },
                  score: { boost: { value: 1 } }
                }
              }
            ],
            minimumShouldMatch: 1
          }
        }
      },
      {
        $addFields: {
          score: { $meta: "searchScore" }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $skip: offset
      },
      {
        $limit: limit
      }
    ]);

    results = await Product.populate(results, {
      path: "seller",
      select: "username"
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Search Error:", error);
    return next(new HttpError("Internal Server Error", 500));
  }
};


export { addProduct, getProductById, getProductsByCategory, editProduct, getProductsBySeller,searchProducts };

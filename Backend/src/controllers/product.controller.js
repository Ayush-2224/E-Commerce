import Product from '../models/product.model.js'
import HttpError from '../models/http-error.js'
import cloudinary, { uploadToCloudinary } from '../lib/cloudinary.js'
import History from '../models/history.model.js'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import Order from '../models/order.model.js'
import mongoose from 'mongoose'
const addProduct = async (req, res, next) => {
  try {
    //console.log("Adding product with data:", req.body);
    //console.log("Files received:", req.files);

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

    let parsedDescription = [];
    try {
      if (description) {
        const rawDescription = typeof description === "string" ? JSON.parse(description) : description;
        const descriptionFiles = (req.files && req.files.descriptionImages) || [];

        for (let i = 0; i < rawDescription.length; i++) {
          const element = rawDescription[i];
          let imageUrl = "";

          if (descriptionFiles[i]) {
            try {
              const uploadResult = await uploadToCloudinary(descriptionFiles[i].buffer);
              imageUrl = uploadResult.secure_url;
            } catch (error) {
              return next(new HttpError("Failed to upload description image", 400));
            }
          }

          parsedDescription.push({
            heading: element.heading || "",
            text: element.text || "",
            image: imageUrl
          });
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
         parsedSpecifications = rawSpecs
  .map(group => ({
    heading: group.heading,
    specs: (group.specs || []).filter(spec => spec.key && spec.value)
  }))
  .filter(group => group.specs.length > 0); // remove empty groups

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

    const savedProduct = await newProduct.save();

    if (!savedProduct) {
      return res.status(500).json({ message: "Failed to create product" });
    }

    // Add product to recommendation model incrementally
    try {
      const productForModel = {
        _id: savedProduct._id.toString(),
        title: savedProduct.title,
        brand: savedProduct.brand,
        category: savedProduct.category,
        description: savedProduct.description
      };

      await axios.post("http://localhost:5000/add-product", {
        product: productForModel
      });
      console.log("Product added to recommendation model incrementally");
    } catch (error) {
      console.error("Failed to add product to recommendation model:", error.message);
      // Don't fail the product creation if recommendation model update fails
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


const getProductById = async (req, res, next) => {
  
  try {
    const { id } = req.params;
    
    const token = req.cookies?.jwt;
    const product = await Product.findById(id);
    if (!product) {
      return next(new HttpError("Product not found", 404));
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
      const userId = decoded.userId;
      await History.deleteOne({ userId, productId: id });
      await History.create({ userId, productId: id });

      const history = await History.find({ userId }).sort({ createdAt: -1 });
      if (history.length > 10) {
        const excess = history.slice(10);
        const idsToRemove = excess.map(entry => entry._id);
        await History.deleteMany({ _id: { $in: idsToRemove } });
      }
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return next(new HttpError("Internal Server Error", 500));
  }
};

export default getProductById;
// change to filter
const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params
    const products = await Product.find({ category })
    if (!products) {
      return next(new HttpError("Products not found", 404))
    }
    return res.status(200).json(products)
  } catch (error) {
    return next(new HttpError("Internal Server Error", 500))
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
    console.log("Editing product with data:", req.body);

    if (!category || !price || !quantity) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const validCategories = ["Electronics", "Appliances", "Mobiles", "Toys", "Books", "Food", "Furniture", "Medicines"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

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
            image: element.image || ""
          };

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

    let parsedSpecifications = product.specifications || [];
    try {
      if (specifications) {
        const rawSpecs = typeof specifications === "string" ? JSON.parse(specifications) : specifications;
        if (Array.isArray(rawSpecs) && rawSpecs.length > 0) {
          parsedSpecifications = rawSpecs
            .map(group => ({
              heading: group.heading,
              specs: (group.specs || []).filter(spec => spec.key && spec.value)
            }))
            .filter(group => group.specs.length > 0);
        } else {
          parsedSpecifications = [];
        }
      }
    } catch (error) {
      return next(new HttpError("Invalid specifications format", 400));
    }

    product.category = category;
    product.price = Number(price);
    product.mrp = Number(mrp) || Number(price);
    product.quantity = Number(quantity);
    product.imageUrl = imageUrl;
    product.description = parsedDescription;
    product.specifications = parsedSpecifications;

    const savedProduct = await product.save({validateBeforeSave: false});
    console.log("Product after save:", savedProduct);

    if (!savedProduct) {
      return res.status(500).json({ message: "Failed to update product" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: savedProduct
    });

  } catch (error) {
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

const getProductsBySeller = async (req, res, next) => {

  try {
    const seller = req.sellerData._id
    const products = await Product.find({ seller })
    if (!products) {
      return null;
    }
    return res.status(200).json({ products })
  } catch (error) {
    console.log(error)
    return next(new HttpError("Internal Server Error", 500))
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

const retrainModel = async (req, res) => {
  try {
    const products = await Product.find({});
    console.log("Retraining model with products:", products.length);
    const response = await axios.post("http://localhost:5000/retrain", {
      products,
    });

    res.status(200).json({ message: "Model retrained successfully", data: response.data });
  } catch (error) {
    console.error("Retraining failed:", error.message);
    res.status(500).json({ error: "Retraining failed" });
  }
};


const Recommendation = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Call Flask API
    const response = await axios.get(`http://localhost:5000/recommend/product/${id}`);
    const { recommended } = response.data;

    // 2. Fetch product details from MongoDB
   const products = await Product.find({ _id: { $in: recommended } })
      .select("_id title price mrp rating imageUrl");
   ;
   return res.status(200).json({ recommended: products});

  } catch (error) {
    console.error("Recommendation error:", error.message);
    return res.status(500).json({ error: "Failed to get recommendations" });
  }
};
const RecommendationbyUserHistory = async (req, res) => {
   // console.log(1);
    const userId  = req.userData._id;
    try{
      const response = await axios.get(`http://localhost:5000/recommend/user/${userId}`);
      const  recommended  = response.data.recommended;
     // console.log(recommended);
      
    // 2. Fetch product details from MongoDB
   const products = await Product.find({ _id: { $in: recommended } })
      .select("_id title price mrp rating imageUrl");
   ;
   return res.status(200).json({ recommended: products});
  } catch (error) {
    console.error("Recommendation error:", error.message);
    return res.status(500).json({ error: "Failed to get recommendations" });
    }    
};

const getTrendingProducts = async (req, res, next) => {
  try {
    // Get products with some basic filtering for trending 
    const products = await Product.find({ quantity: { $gt: 0 } })
      .sort({ createdAt: -1 }) // Most recent products
      .limit(6) // Get 6 products
      .select("_id title price mrp rating imageUrl");


    return res.status(200).json({ trending: products });
  } catch (error) {
    console.error("getTrendingProducts error:", error);
    return next(new HttpError("Internal Server Error", 500));
  }
};

const getProductBreakdownStats = async (req, res, next) => {
 // console.log(1);
  const { productId } = req.params;
  const sellerId = req.sellerData._id;
  
  try {
    
   // console.log('Getting breakdown for productId:', productId, 'sellerId:', sellerId);

    const product = await Product.findOne({ _id: productId, seller: sellerId }).lean();
    if (!product) {
      //  console.log('Product not found or not authorized');
      return res.status(404).json({ message: "Product not found or not authorized" });
    }

   // console.log('Product found:', product.title);

   // console.log('Product found:', product.title);

    const [stats] = await Order.aggregate([
      { $match: { productId: { $in: [new mongoose.Types.ObjectId(productId)] } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: {
            $sum: {
              $cond: [
                { $or: [{ $eq: ['$paymentStatus', 'Paid'] }, { $eq: ['$orderStatus', 'Order Delivered'] }] },
                1,
                0
              ]
            }
          },
          totalCancellations: {
            $sum: {
              $cond: [{ $eq: ['$orderStatus', 'Order Cancelled'] }, 1, 0]
            }
          },
          totalMoneyReceived: {
            $sum: {
              $cond: [
                { $or: [{ $eq: ['$paymentStatus', 'Paid'] }, { $eq: ['$orderStatus', 'Order Delivered'] }] },
                '$price',
                0
              ]
            }
          }
        }
      }
    ]);

    //console.log('Aggregation result:', stats);

    const {
      totalOrders = 0,
      totalSales = 0,
      totalCancellations = 0,
      totalMoneyReceived = 0
    } = stats || {};

    const successRate = totalOrders ? ((totalSales / totalOrders) * 100).toFixed(1) : '0.0';
    const averageOrderValue = totalSales ? (totalMoneyReceived / totalSales).toFixed(2) : '0.00';

    return res.status(200).json({
      message: "Product breakdown retrieved successfully",
      breakdown: {
        productInfo: {
          id: product._id,
          title: product.title,
          brand: product.brand,
          price: product.price,
          mrp: product.mrp,
          image: product.imageUrl?.[0] || null,
          currentStock: product.quantity,
          category: product.category,
          rating: product.rating
        },
        stats: {
          totalOrders,
          totalSales,
          totalCancellations,
          totalMoneyReceived,
          successRate: parseFloat(successRate),
          averageOrderValue
        }
      }
    });

  } catch (error) {
    console.error("getProductBreakdownStats error:", error);
    return next(new HttpError("Internal Server Error", 500));
  }
};

const getProductOrders = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const sellerId = req.sellerData._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

   // console.log('Getting orders for productId:', productId, 'page:', page, 'limit:', limit);

    // Confirm ownership
    const product = await Product.findOne({ _id: productId, seller: sellerId }).lean();
    if (!product) {
      console.log('Product not found or not authorized for orders');
      return res.status(404).json({ message: "Product not found or not authorized" });
    }

    const totalOrders = await Order.countDocuments({ productId});

    const orders = await Order.find({ productId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const orderDetails = orders.map(order => ({
      orderId: order._id,
      customerName: order.userId?.username || 'N/A',
      customerEmail: order.userId?.email || 'N/A',
      price: order.price,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      orderDate: order.createdAt,
      refundLimit: order.refundLimit
    }));

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders: orderDetails,
      pagination: {
        currentPage: page,
        pageSize: limit,
      }
    });

  } catch (error) {
    console.error("getProductOrders error:", error);
    return next(new HttpError("Internal Server Error", 500));
  }
};



export { addProduct, getProductById, getProductsByCategory, editProduct, getProductsBySeller, searchProducts, retrainModel, Recommendation, getTrendingProducts, getProductBreakdownStats, getProductOrders, RecommendationbyUserHistory };

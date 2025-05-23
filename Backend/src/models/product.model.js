import mongoose from "mongoose";
import HttpError from "./http-error.js";
const descriptionBlockSchema = mongoose.Schema({
  heading: {
    type: String,
    required: false
  },
  text: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  }
}, { _id: false });

const specificationEntrySchema = mongoose.Schema({
    key:{
        type: String,
        required: true
    },
    value:{
        type: String,
        required: true
    }
}, {_id: false});

const specificationGroupSchema = mongoose.Schema({
    heading:{
        type: String
    },
    specs: [specificationEntrySchema]
}, {_id: false})

const productSchema = mongoose.Schema({
    brand:{
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["Electronics", "Appliances", "Mobiles", "Toys", "Books", "Food", "Furniture", "Medicines"],
        index: true
    },
    imageUrl: {
        type: [String]
    },
    price: {
        type: Number,
        min:0  
    },
    mrp:{
        type: Number,
        min:0  
    },
    description: {
        type: [descriptionBlockSchema]
    },
    specifications: {
        type: [specificationGroupSchema]
    },  
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true
    },
    quantity: {
        type: Number
    },
    rating:{
        type:Number,
        default:0
    }
});

const Product = mongoose.model('Product', productSchema);

productSchema.pre("save", function (next) {
    if (this.isModified("price") || this.isModified("mrp")) {
      if (this.mrp < this.price) {
        return next(new HttpError("Price cannot be greater than MRP", 400));
      }
    }
    next();
  });
  

export default Product; 
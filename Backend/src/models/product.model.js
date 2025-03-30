import mongoose from "mongoose";

const descriptionElementSchema = mongoose.Schema({
    type:{
        type:String,
        enum: ["text", "image"],
        required:true
    },
    data:{
        type:String,
        required: true
    }
}, {_id: false})

const productSchema = mongoose.Schema({
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
    mrp: {
        type: Number,
        min:0  
    },
    description: {
        type: [descriptionElementSchema]
    },
    specifications: {
        type: String
    },
    seller: {
        type: String
    },
    quantity: {
        type: Number  
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product; 
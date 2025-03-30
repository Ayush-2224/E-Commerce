import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    category: {
        type: String,
        index: true
    },
    imageUrl: {
        type: [String]
    },
    price: {
        type: Number  
    },
    mrp: {
        type: Number  
    },
    description: {
        type: String
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
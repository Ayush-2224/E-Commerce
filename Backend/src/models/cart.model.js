import mongoose from "mongoose";

const productEntrySchema = mongoose.Schema({
    productId:{
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true
    },
    quantity:{
        type: Number,
        required: true,
        min: 1
    }
}, {_id: false})

const cartSchema = mongoose.Schema({
    products:{
        type: [productEntrySchema],
        default: []
    },
    userId:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
        unique:true,
    }
}, {_id: false})

const Cart = mongoose.model("Cart", cartSchema);
export {productEntrySchema};
export default Cart;
import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
    products:{
        type: [mongoose.Schema.ObjectId],
        ref: "Product"
    },
    userId:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
        unique:true,
    }
}, {_id: false})

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
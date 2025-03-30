import mongoose, { Mongoose } from "mongoose";

const ReviewSchema = mongoose.Schema({
    review:{
        type:String,
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required:true
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true})

const Review = mongoose.Model("Review", ReviewSchema)

export default Review
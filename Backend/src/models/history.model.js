import mongoose from "mongoose";

const historySchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        },
        productId: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: true
        }
    }, { timestamps: true }
);

const History = mongoose.model("History", historySchema);
export default History;
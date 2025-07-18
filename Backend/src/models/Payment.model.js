import mongoose from "mongoose";

const PaymentSchema = mongoose.Schema({
    type:{
        type: String,
        enum: ["Receive", "Refunded", "Payment to Seller"],
        required: true
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
    },
    sellerId:{
        type:mongoose.Schema.ObjectId,
        ref:"Seller",
    },
    orderId:{
        type:mongoose.Schema.ObjectId,
        ref:"Order",
        required:true,
    },
    amount:{
        type:Number,
        required:true,
        min: [1, 'Quantity must be greater than 0']
    },
    transactionId:{
        type:String,
        required:true
    }
},{timestamps:true})

const Payment = mongoose.model("Payment",PaymentSchema);
export default Payment;
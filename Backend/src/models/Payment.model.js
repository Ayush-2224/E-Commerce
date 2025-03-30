import mongoose from "mongoose";

const PaymentSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    productId:{
        type:mongoose.Schema.ObjectId,
        ref:"Product",
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
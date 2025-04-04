import mongoose from "mongoose";
const orderSchema = mongoose.Schema(
    {
        productId:{
            type:[mongoose.Schema.ObjectId],
            ref:"Product",
            required:true
        },
        quantity:{
            type:Number,
            required:true,
            min:1
        },
        price:{
            type:Number,
            required:true,
            min:0
        },
        mrp:{
            type:Number,
            required:true
        },
        paymentStatus:{
            type:String,
            enum:["Not Paid","Paid","Cancelled","Refunded"],
            required:true,
            default:"Not Paid"

        },
        orderStatus:{
            type:String,
            enum:["Order Placed","Order Shipped","Order Delivered","Order Cancelled"],
            required:true,
            default:"Order Placed"
        },
        userId:{
            type:mongoose.Schema.ObjectId,
            ref:"User",
            required:true
        }
    },{timestamps:true}
)

const Order = mongoose.model("Order",orderSchema);

export default Order 
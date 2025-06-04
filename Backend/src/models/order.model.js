import mongoose from "mongoose";
const orderSchema = mongoose.Schema(
    {
        productId:{
            type:[mongoose.Schema.ObjectId],
            ref:"Product",
            required:true
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
        userId:{
            type:mongoose.Schema.ObjectId,
            ref:"User",
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
        refundLimit:{
            type:Date,
            
        },
        sellerPaid:{
            type:Boolean,
            default:false
        },
    },{timestamps:true}
)


const refundTime=10*24*60*60*1000; // 10 days in milliseconds
orderSchema.pre("save", function(next) {
    if (this.isNew) {
        this.refundLimit = new Date(Date.now() + refundTime);
    }
    next();
});

orderSchema.virtual('isRefundEligible').get(function () {
  return new Date() <= this.refundLimit;
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });


const Order = mongoose.model("Order",orderSchema);

export default Order
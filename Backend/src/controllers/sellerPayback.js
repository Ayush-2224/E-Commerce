import Order from "../models/order.model";
import cron from "node-cron"
import razorpay from "../lib/razorpay.js";
import Payment from "../models/Payment.model.js";
import Seller from "../models/seller.model.js";
import Product from "../models/product.model.js";
import { retrainModel } from "../controllers/retrainController.js";


const retry = async (fn, maxRetries = 3, delay = 2000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            console.log(`Retry ${i + 1}/${maxRetries} for payout...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};


cron.schedule("0 0 * * *", async () => {
    try {
        console.log(" Starting daily payout processing...");
        const now = new Date();

        const ordersToPay = await Order.find({
            orderStatus: "Order Delivered",
            refundLimit: { $lt: now },
            sellerPaid: false,
        });

        console.log(` Found ${ordersToPay.length} orders eligible for payout`);

        let successCount = 0;
        let failCount = 0;

        for (const order of ordersToPay) {
            try {
                await payseller(order);
                successCount++;
                console.log(` Paid seller for order ${order._id}`);
            } catch (error) {
                failCount++;
                console.error(`Failed payout for order ${order._id}:`, error.message);
            }
        }

        console.log(` Payout summary: ${successCount} successful, ${failCount} failed`);
    } catch (error) {
        console.error(" Critical error in payout processing:", error);
    }
});

async function payseller(order) {
    
    if (!order.productId || order.productId.length === 0) {
        throw new Error("Order has no valid product");
    }

    const amountToPay = order.price * 0.9 * 100; 
    
    
    const product = await Product.findById(order.productId[0]);
    if (!product) {
        throw new Error("Product not found");
    }

    const seller = await Seller.findById(product.seller);
    if (!seller) {
        throw new Error("Seller not found");
    }

    if (!seller.razorpayAccountId || seller.razorpayAccountId.trim() === '') {
        throw new Error("Seller has no valid Razorpay account");
    }

    
    if (amountToPay < 100) { 
        throw new Error("Payout amount too small");
    }

    try {
        
        const payoutResponse = await retry(async () => {
            return await razorpay.payouts.create({
                account_number: seller.razorpayAccountId,
                amount: amountToPay,
                currency: "INR",
                mode: "IMPS",
                purpose: "payout",
                narration: `Payout for order ${order._id}`,
                queue_if_low_balance: true,
            });
        });

        
        order.sellerPaid = true;
        await order.save();

        
        const paymentRecord = new Payment({
            type: "Payment to Seller",
            sellerId: seller._id, 
            orderId: order._id,
            amount: amountToPay / 100, 
            transactionId: payoutResponse.id,
        });
        await paymentRecord.save();

        return payoutResponse;
    } catch (err) {
        console.error(` Payout failed for order ${order._id}:`, err.message);
        throw err; 
    }
}


cron.schedule("0 0 1 * *", async () => {
  console.log(" Starting monthly model retraining for maintenance...");
  try {
    await retrainModel({ params: {} }, { status: () => ({ json: console.log }) });
    console.log("✅ Monthly model retraining completed successfully");
  } catch (error) {
    console.error("❌ Monthly model retraining failed:", error);
  }
});

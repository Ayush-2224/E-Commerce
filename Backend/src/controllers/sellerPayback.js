import Order from "../models/order.model";
import cron from "node-cron"
import razorpay from "../lib/razorpay.js";
import Payment from "../models/Payment.model.js";
import { retrainModel } from "../controllers/retrainController.js";

// Daily payout processing
cron.schedule("0 0 * * *", async () => {
    try {
        const now = new Date();

        const ordersToPay = await Order.find({
            orderStatus: "Order Delivered",
            refundLimit: { $lt: now },
            sellerPaid: false,
        });

        for (const order of ordersToPay) {
            await payseller(order);
            console.log(`Paid seller for order ${order._id}`);
        }
    } catch (error) {
        console.error("Error processing payouts:", error);
    }
});

async function payseller(order) {
    const amountToPay = order.price * 0.9 * 100;
    try {
        payoutResponse = await razorpay.payouts.create({
            account_number: order.sellerPayoutAccountId,
            amount: amountToPay,
            currency: "INR",
            mode: "IMPS",
            purpose: "payout",
            narration: `Payout for order ${order._id}`,
            queue_if_low_balance: true,
        })
        order.sellerPaid = true;
        await order.save();
        const bill= new Payment({
            type: "Payment to Seller",
            sellerId: order.sellerId,
            orderId: order._id,
            amount: amountToPay / 100, // Convert back to original amount
            transactionId: payoutResponse.id,
        });
        await bill.save();
    } catch (err) {
        console.error(`Failed payout for order ${order._id}`, err);
    }
}

// Monthly model retraining for maintenance (first day of month at midnight)
cron.schedule("0 0 1 * *", async () => {
  console.log("⏰ Starting monthly model retraining for maintenance...");
  try {
    await retrainModel({ params: {} }, { status: () => ({ json: console.log }) });
    console.log("✅ Monthly model retraining completed successfully");
  } catch (error) {
    console.error("❌ Monthly model retraining failed:", error);
  }
});

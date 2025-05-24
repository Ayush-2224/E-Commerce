import { Router } from "express";
import verifyUserAuthentication from "../middleware/userAuth.middleware.js";
import { addReview, changeReview, deleteReview, getReviews, getUserReviews, getRatingBreakdown, getUserReviewForProduct } from "../controllers/reviews.controller.js";

const router = Router()

router.post("/create/:productId", verifyUserAuthentication, addReview)
router.get("/getUserReviewForProduct/:productId", verifyUserAuthentication, getUserReviewForProduct)
router.get("/get/:productId/:sortBy/:num", getReviews)
router.put("/update/:productId", verifyUserAuthentication, changeReview)
router.delete("/delete/:productId", verifyUserAuthentication, deleteReview)
router.get("/getUserReviews", verifyUserAuthentication, getUserReviews)
router.get("/getReviewBreakdown/:productId", getRatingBreakdown)
export default router
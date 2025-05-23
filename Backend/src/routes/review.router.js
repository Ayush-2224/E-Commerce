import { Router } from "express";
import verifyUserAuthentication from "../middleware/userAuth.middleware.js";
import { addReview, changeReview, deleteReview, getReviews, getUserReviews, getRatingBreakdown } from "../controllers/reviews.controller.js";

const router = Router()

router.post("/add/:productId", verifyUserAuthentication, addReview)
router.get("/get/:productId/:sortBy/:num", getReviews)
router.post("/change/:productId", verifyUserAuthentication, changeReview)
router.delete("/delete/:productId", verifyUserAuthentication, deleteReview)
router.get("/getUserReviews", verifyUserAuthentication, getUserReviews)
router.get("/getReviewBreakdown/:productId", getRatingBreakdown)
export default router
import { Router } from "express";
import verifyUserAuthentication from "../middleware/userAuth.middleware";
import { addReview, changeReview, deleteReview, getReviews, getUserReviews } from "../controllers/reviews.controller";

const router = Router()

router.post("/add/:productId", verifyUserAuthentication, addReview)
router.get("/get/:productId:/:sortBy/:num", getReviews)
router.post("/change/:productId", verifyUserAuthentication, changeReview)
router.delete("delete/:productId", verifyUserAuthentication, deleteReview)
router.get("/getReviews", verifyUserAuthentication, getUserReviews)

export default router
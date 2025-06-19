import {Router} from "express"
import { addProductToCart, changeQuantityFromCart, checkProductinCart, getCart, removeProductFromCart, getProducts } from "../controllers/cart.controller.js";
import verifyUserAuthentication from "../middleware/userAuth.middleware.js";

const router = Router();

router.get("/getCart",  verifyUserAuthentication,getCart)
router.post("/add/:productId", verifyUserAuthentication,addProductToCart)
router.delete("/remove/:productId",  verifyUserAuthentication,removeProductFromCart)
router.put("/modifyQty/:productId",  verifyUserAuthentication,changeQuantityFromCart)
router.get("/check/:productId", verifyUserAuthentication, checkProductinCart)
router.post("/getProducts", getProducts)
export default router
import {Router} from "express"
import { addProductToCart, changeQuantityFromCart, getCart, removeProductFromCart } from "../controllers/cart.controller.js";
import verifyUserAuthentication from "../middleware/userAuth.middleware.js";

const router = Router();

router.post("/addProduct/:productId", verifyUserAuthentication,addProductToCart)
router.post("/getCart",  verifyUserAuthentication,getCart)
router.delete("/remove/:productId",  verifyUserAuthentication,removeProductFromCart)
router.post("/modifyQty/:productId",  verifyUserAuthentication,changeQuantityFromCart)

export default router
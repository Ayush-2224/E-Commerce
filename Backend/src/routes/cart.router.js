import {Router} from "express"
import { addProductToCart, changeQuantityFromCart, getCart, removeProductFromCart } from "../controllers/cart.controller.js";
import verifyUserAuthentication from "../middleware/userAuth.middleware.js";

const router = Router();

router.get("/getCart",  verifyUserAuthentication,getCart)
router.post("/addProduct/:productId", verifyUserAuthentication,addProductToCart)
router.delete("/remove/:productId",  verifyUserAuthentication,removeProductFromCart)
router.put("/modifyQty/:productId",  verifyUserAuthentication,changeQuantityFromCart)

export default router
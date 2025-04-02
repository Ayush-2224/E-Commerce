import { Router } from 'express';
import { signup as sellerSignup,login as sellerLogin,logout as sellerLogout} from '../controllers/sellerAuth.controller.js';
const router= Router();

router.route("/signup").post(sellerSignup)
router.route("/login").post(sellerLogin)
router.route("/logout").get(sellerLogout)

export default router;
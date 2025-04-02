import { Router } from 'express';
import { signup as userSignup,login as userLogin,logout as userLogout} from '../controllers/userAuth.controller.js';
const router= Router();

router.route("/signup").post(userSignup)
router.route("/login").post(userLogin)
router.route("/logout").get(userLogout)

export default router;
import { Router } from 'express';
import { signup as sellerSignup,login as sellerLogin,logout as sellerLogout,checkAuth as sellerCheckAuth} from '../controllers/sellerAuth.controller.js';
import fileUpload from '../middleware/file-upload.js';
import verifySellerAuthentication from '../middleware/sellerAuth.middleware.js'

const router= Router();

router.route("/signup").post(fileUpload.single("profilePic"), sellerSignup)
router.route("/login").post(sellerLogin)
router.route("/logout").get(sellerLogout)
router.route("/sellerInfo").get(verifySellerAuthentication,sellerCheckAuth)
export default router;  
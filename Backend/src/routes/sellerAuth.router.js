import { Router } from 'express';
import { signup as sellerSignup,login as sellerLogin,logout as sellerLogout} from '../controllers/sellerAuth.controller.js';
import fileUpload from '../middleware/file-upload.js';
const router= Router();

router.route("/signup").post(fileUpload.single("profilePic"), sellerSignup)
router.route("/login").post(sellerLogin)
router.route("/logout").get(sellerLogout)

export default router;
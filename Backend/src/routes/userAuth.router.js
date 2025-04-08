import { Router } from 'express';
import { signup as userSignup,login as userLogin,logout as userLogout} from '../controllers/userAuth.controller.js';
import fileUpload from '../middleware/file-upload.js';
const router= Router();


router.route("/signup").post(fileUpload.single("profilePic") ,userSignup)
router.route("/login").post(userLogin)
router.route("/logout").get(userLogout)

export default router;
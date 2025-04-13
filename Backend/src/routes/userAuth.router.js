import { Router } from 'express';
import { signup as userSignup,login as userLogin,logout as userLogout,checkAuth as userCheckAuth} from '../controllers/userAuth.controller.js';
import fileUpload from '../middleware/file-upload.js';
import verifyUserAuthentication from '../middleware/userAuth.middleware.js';
const router= Router();


router.route("/signup").post(fileUpload.single("profilePic") ,userSignup)
router.route("/login").post(userLogin)
router.route("/logout").get(userLogout)
router.route("/userInfo").get(verifyUserAuthentication,userCheckAuth)
export default router;
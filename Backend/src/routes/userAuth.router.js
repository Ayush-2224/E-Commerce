import { Router } from 'express';
import { signup as userSignup,login as userLogin,logout as userLogout,checkAuth as userCheckAuth,googleAuth,googleCallback,forgotPassword,resetPassword,editProfile,userHistory} from '../controllers/userAuth.controller.js';
import fileUpload from '../middleware/file-upload.js';
import verifyUserAuthentication from '../middleware/userAuth.middleware.js';
const router= Router();

router.route("/signup").post(fileUpload.single("profilePic") ,userSignup)
router.route("/login").post(userLogin)
router.route("/logout").post(userLogout)
router.route("/userInfo").get(verifyUserAuthentication,userCheckAuth)
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleCallback);
router.post('/forget-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/edit-profile', verifyUserAuthentication, fileUpload.single("profilePic"), editProfile);
router.get('/user-history',verifyUserAuthentication, userHistory);

export default router;
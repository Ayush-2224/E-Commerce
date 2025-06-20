import express from 'express';
import { addProduct, getProductById, getProductsByCategory, getProductsBySeller ,editProduct,searchProducts,retrainModel,Recommendation} from '../controllers/product.controller.js';
import verifySellerAuthentication from '../middleware/sellerAuth.middleware.js';
import fileUpload from '../middleware/file-upload.js';
import verifyUserAuthentication from '../middleware/userAuth.middleware.js';
const router = express.Router();


// Product routes
router.post('/addProduct', verifySellerAuthentication, fileUpload.fields([
    {name: "mainImages", maxCount: 10},
    {name: "descriptionImages", maxCount:10}
]), addProduct);
router.get('/getProduct/:id',getProductById)
router.get('/filterProducts/:category',getProductsByCategory)
router.post('/editProduct/:id',verifySellerAuthentication,fileUpload.fields([
    {name: "mainImages", maxCount: 10},
    {name: "descriptionImages", maxCount:10}
]),editProduct)
router.get('/getProductsBySeller',verifySellerAuthentication,getProductsBySeller)
router.get('/search',searchProducts)
//router.post('/retrainModel', retrainModel);
router.get("/recommend/:id", Recommendation);

export default router;
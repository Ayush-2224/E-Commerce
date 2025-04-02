import express from 'express';
import multer from 'multer';
import { addProduct } from '../controllers/product.controller.js';
import verifySellerAuthentication from '../middleware/sellerAuth.middleware.js';
import { getProductById, getProductsByCategory } from '../controllers/product.controller.js';


const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Product routes
router.post('/addProduct', verifySellerAuthentication, upload.single('image'), addProduct);
router.get('/getProduct/:id',getProductById)
router.get('/filterProducts/:category',getProductsByCategory)

export default router; 
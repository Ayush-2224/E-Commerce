import Review from '../models/reviews.model.js';
import HttpError from '../models/http-error.js';
import Product from '../models/product.model.js'; // Assuming product model path
import mongoose from 'mongoose';
const calculateOverallRating = async (productId) => {
    const reviews = await Review.find({ productId });
    if (reviews.length === 0) {
        return 0;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
};

const addReview = async (req, res, next) => {
    try{
        const {heading, review, rating} = req.body;
        const {productId} = req.params;
        const userId = req.userData._id;

        const existingReview = await Review.findOne({ productId, userId });
        
        if (existingReview) {
            return next(new HttpError("You have already reviewed this product.", 400));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(new HttpError("Product not found", 404));
        }
        const newReview = new Review({
            heading,
            review,
            rating,
            productId,
            userId
        });
        await newReview.save();

        product.rating = await calculateOverallRating(productId);
        await product.save();

        res.status(201).json({message: "Review added successfully"});
    }catch(error){
        console.log("add review error: ", error);
        return next(new HttpError("An error occurred while adding the review", 500));
    }
}

const getReviews = async (req, res, next) =>{
    try{
        const {productId, sortBy, num} = req.params;
        const offset = parseInt(req.query.offset || "0", 10)
        const limit = parseInt(req.query.limit || "4", 10)
        const sortOrder = parseInt(num, 10);
        const reviews = await Review.find({productId})
                        .sort({[sortBy]: sortOrder})
                        .skip(offset)
                        .limit(limit)
                        .populate("userId", "username profilePic")
                        .select("review rating userId updatedAt");

        res.json(reviews)
    }catch(error){
        console.log("get reviews error: ", error);
        return next(new HttpError("An error occurred while getting the reviews", 500));
    }
}

const changeReview = async (req, res, next) => {
    try{
        const {heading, review, rating} = req.body;
        const {productId} = req.params;
        const userId = req.userData._id;
        const updatedReview = await Review.findOneAndUpdate({productId, userId}, {
            heading,
            review,
            rating
        }, {new: true});

        if (!updatedReview) {
            return next(new HttpError("Review not found or user not authorized to change it", 404));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(new HttpError("Product not found while updating review stats", 404));
        }
        product.rating = await calculateOverallRating(productId);
        await product.save();

        res.json(updatedReview);
    }catch(error){
        console.log("change review error: ", error);
        return next(new HttpError("An error occurred while changing the review", 500));
    }
}

const deleteReview = async (req, res, next) =>{
    const {productId} = req.params;
    const userId = req.userData._id;
    try{
        const deletedReview = await Review.findOneAndDelete({productId, userId});

        if (!deletedReview) {
            return next(new HttpError("Review not found or user not authorized to delete it", 404));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(new HttpError("Product not found while updating review stats", 404));
        }
        product.rating = await calculateOverallRating(productId);
        await product.save();

        res.status(200).json({message: "Review deleted successfully"});
    }catch(error){
        console.log("delete review error: ", error);
        return next(new HttpError("An error occurred while deleting the review", 500));
    }
}

const getUserReviews = async (req, res, next) => {
    const userId = req.userData._id;
    try {
        const reviews = await Review.find({userId})
            .select("-_id"); 
        res.status(201).json(reviews);
    } catch (error) {
        console.log("get user reviews error: ", error);
        return next(new HttpError("An error occurred while getting the user reviews", 500));
    }
};

const getRatingBreakdown = async (req, res, next) =>{
    const {productId} = req.params
    
    try{
        
        const ratingStats = await Review.aggregate([
            {
                $match: {
                    productId: new mongoose.Types.ObjectId(productId) 
                }
            },
            {
                $group:{
                    _id: "$rating",
                    count: {$sum: 1}
                }
            }
        ])
        
        const ratingsBreakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        ratingStats.forEach(r => {
            ratingsBreakdown[r._id] = r.count
        });
        
        res.json(ratingsBreakdown)
    }catch(err){
        console.error("getRatingSummary error:", err);
        return next(new HttpError("Failed to load rating summary", 500));
    }
}

export {addReview, getReviews, changeReview, deleteReview, getUserReviews, getRatingBreakdown}
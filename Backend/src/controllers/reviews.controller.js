import Review from '../models/reviews.model.js';
import HttpError from '../models/http-error.js';

const addReview = async (req, res, next) => {
    try{
        const {review, rating, productId} = req.body;
        const {userId} = req.userData._id;
        const newReview = new Review({
            review,
            rating,
            productId,
            userId
        });
        await newReview.save();
        res.status(201).json({message: "Review added successfully"});
    }catch(error){
        console.log("add review error: ", error);
        return next(new HttpError("An error occurred while adding the review", 500));
    }
}
const getReviews = async (req, res, next) =>{
    try{
        const {productId, sortBy, num} = req.params;
        const reviews = await Review.find({productId})
                        .sort({[sortBy]: num})
                        .populate("userId", "username profilePic")
                        .select("review rating userId - _id");
        res.json(reviews)
    }catch(error){
        console.log("get reviews error: ", error);
        return next(new HttpError("An error occurred while getting the reviews", 500));
    }
}

const changeReview = async (req, res, next) => {
    try{
        const {review, rating} = req.body;
        const {productId} = req.params;
        const {userId} = req.userData._id;
        const updatedReview = await Review.findOneAndUpdate({productId, userId}, {
            review,
            rating
        }, {new: true});
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
        await Review.findOneAndDelete({productId, userId});
        res.status(200).json({message: "Review deleted successfully"});
    }catch(error){
        console.log("delete review error: ", error);
        return next(new HttpError("An error occurred while deleting the review", 500));
    }
}

const getUserReviews = async (req, res, next) => {
    const userId = req.userData._id;
    try {
        const reviews = await Review.find({ userId })
            .select("productId rating review - _id"); 
        
        res.json(reviews);
    } catch (error) {
        console.log("get user reviews error: ", error);
        return next(new HttpError("An error occurred while getting the user reviews", 500));
    }
};


export {addReview, getReviews, changeReview, deleteReview, getUserReviews}
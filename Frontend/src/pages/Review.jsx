import React from 'react'
import { useState, useEffect } from 'react'
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import HorizontalLine from '../components/UIElements/HorizontalLine';
const Review = () => {
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState(null);
    const { productId } = useParams();
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [error, setError] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [formState, setFormState] = useState({
        ratingTouched: false,
        descriptionTouched: false,
    });

    const isDescriptionInvalid = formState.descriptionTouched && (!review?.review || review.review.trim() === '');
    const isRatingInvalid = formState.ratingTouched && (!review?.rating || review.rating <= 0);

    const handleSubmit = async () => {
        setFormState({
            ratingTouched: true,
            descriptionTouched: true,
        })
        setLoading(true)
        if (!review.rating || review.rating <= 0 || !review.review || review.review.trim() === '') {
            toast.error("Please fill all the fields correctly.");
            return;
        }

        try{
            if(alreadyReviewed){
                const res = await axiosInstance.put(`/review/update/${productId}`, review);
                    toast.success("Review updated successfully!");
                    setReview(res.data);
            }else{
                const res = await axiosInstance.post(`/review/create/${productId}`, review);
                    toast.success("Review added successfully!");
                    setReview(res.data);
                    setAlreadyReviewed(true);
            }
        }catch (err) {
            toast.error(err.response.data.message);
            setError(err.response.data.message);
        }finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        const fetchReview = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get(`/review/getUserReviewForProduct/${productId}`);
                    setReview(res.data);
                    if(res.data)
                    setAlreadyReviewed(true);
            } catch (err) {
                toast.error(err.response.data.message);
                setError(err.response.data.message);
            } finally {
                setLoading(false);
            }
        }

        fetchReview();
    }, [])

    if (loading) {
        return <LoadingSpinner asOverlay={true} />
    }

    return (
        <div>
            <div>
                <h1>Rate this Product</h1>
                <div className='flex space-x-1 text-5xl'>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}
                            className={`cursor-pointer ${(hoverRating || review?.rating || 0) >= star
                                    ? 'text-yellow-300'
                                    : 'text-gray-300'
                                }`}
                            onClick={() => {
                                setReview({ ...review, rating: star })
                                setFormState({ ...formState, ratingTouched: true })
                            }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            ★
                        </span>
                    ))}

                </div>
                {isRatingInvalid && <p className="text-red-500 text-sm mt-1">Rating is required.</p>}
            </div>
            <div>
                <h1>Review this Product</h1>
                <div className='border border-gray-300 p-3 rounded-lg m-3'>
                    <div><h2>Description</h2>
                        <input type="text"
                            className='w-full focus:outline-none mt-3'
                            placeholder='Description...'
                            value={review?.review || ''}
                            onChange={(e) => setReview({ ...review, review: (e.target.value) })}
                            onBlur={() => setFormState({ ...formState, descriptionTouched: true })} />
                    </div>
                    {isDescriptionInvalid && <p className="text-red-500 text-sm mt-1">Description is required.</p>}
                    <HorizontalLine />
                    <div><h2>Title (optional)</h2>
                        <input type="text" className='w-full focus:outline-none mt-3' placeholder='Title...' value={review?.heading || ""} onChange={(e) => setReview({ ...review, heading: (e.target.value) })} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="bg-amber-500 text-white px-8 py-2 font-semibold mr-20 my-5 hover:bg-amber-600 rounded cursor-pointer" onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        </div>
    )
}

export default Review

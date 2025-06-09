import React from 'react'
import { useState } from 'react'
import { useRef, useEffect, useCallback } from 'react';
const UserReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef()
    const [sortBy, setSortBy] = useState("rating");
    const [sortOrder, setSortOrder] = useState(-1);
    const limit = 5

    const fetchReviews = async (currentOffset = offset) => {
            try {
                setLoading(true);
                const response = await axiosInstance(`/review/get/${productId}/${sortBy}/${sortOrder}`, {
                    params: {
                        offset: currentOffset,
                        limit,
                    },
                });
                const newReviews = response.data;
                if(newReviews.length < limit) {
                    setHasMore(false);
                }
    
                setReviews((prev) => [...prev, ...newReviews]);
                setOffset((prevOffset) => prevOffset + newReviews.length);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }finally{
                setLoading(false);
            }
        };
    
        const lastReviewRef = useCallback(
            (node) => {
                if(loading) return;
                if(observerRef.current) observerRef.current.disconnect()
                observerRef.current = new IntersectionObserver((entries) =>{
                    if(entries[0].isIntersecting && hasMore){
                        fetchReviews();
                    }
                })
                if(node) observerRef.current.observe(node)
            },
        [loading, hasMore]
        )
    
        
        useEffect(() => {
            setOffset(0);
            setReviews([]);
            setHasMore(true);
            fetchReviews(0);
        }, [productId, sortBy, sortOrder]);

  return (
    <div className='p-4'>
        <div className='flex items-center mb-4 gap-4'>
            <label className='font-medium'>
                Sort by:
                <select className='ml-2 p-1 border rounded'
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}>
                    <option value="rating">Rating</option>
                    <option value="date">Date</option>
                </select>
                </label>
        </div>

        <button className='px-3 py-1 bg-blue-600 text-white rounded cursor-pointer' onClick={() =>{setSortOrder(prev => prev*-1)}}>
        {sortOrder === 1 ? "↑ Ascending" : "↓ Descending"}
        </button>

        {reviews.length === 0 && !loading ? (
                <p>No reviews yet.</p>
            ) : (
                reviews.map((review, index) => {
                    const isLast = index === reviews.length - 1;
                    return (
                        <div
                            key={review._id}
                            ref={isLast ? lastReviewRef : null}
                            className="mb-4 p-3"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <img
                                    src={review.userId.profilePic}
                                    alt="User"
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                                <span className="font-medium">{review.userId.username}</span>
                            </div>
                            <div className="inline-flex text-xs items-center font-medium bg-green-600 text-white px-2 py-1 rounded">
                                {review.rating}
                                <span className="ml-1">☆</span>
                            </div>
                            <p>{review.review}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(review.updatedAt).toLocaleDateString()}
                            </p>
                            <HorizontalLine />
                        </div>
                    );
                })
            )}
            {loading && <LoadingSpinner centered/>}
    </div>
  )
}

export default UserReviews

import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios';
import LoadingSpinner from "../components/UIElements/LoadingSpinner";
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ProductImageGallery from '../components/UIElements/ProductImageGallery';
// import RatingBreakdown from '../components/UIElements/RatingBreakdown';
import DeliveryInfo from '../components/UIElements/DelieryInfo';
import HorizontalLine from '../components/UIElements/HorizontalLine';
import Recommend from '../components/UIElements/Recommend';
import { useUserAuthStore } from '../store/userAuth.store';

const Product = () => {
    const { productId } = useParams();
    const { authUser } = useUserAuthStore();
    const [recommendations, setRecommendations] = useState([]);
    const isLoggedIn = !!authUser;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ratings, setRatings] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [userHistory, setUserHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const sortBy = "rating";  // or "createdAt"
    const sortOrder = -1;     // -1 for descending, 1 for ascending

    // Simple SVG placeholder as data URI
    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='75' y='75' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const limit = 4; // adjust max number as needed
            const response = await axiosInstance(`/review/get/${productId}/${sortBy}/${sortOrder}`, {
                params: {
                    offset: 0,
                    limit,
                },
            });
            setReviews(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setLoading(false);
        }
    };

    const fetchUserHistory = async () => {
        if (!isLoggedIn) return;

        setLoadingHistory(true);
        try {
            const response = await axiosInstance.get('/user/user-history');
            setUserHistory(response.data.history || []);
        } catch (error) {
            console.error('Error fetching user history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const getImageUrl = (item) => {
        if (item.image) {
            return item.image;
        }
        if (item.imageUrl && item.imageUrl[0]) {
            return item.imageUrl[0];
        }
        return null;
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    useEffect(() => {
        fetchUserHistory();
    }, [productId, isLoggedIn]);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const res = await axiosInstance(`review/getReviewBreakdown/${productId}`);
                setRatings(res.data);
            } catch (err) {
                console.error("Error fetching ratings", err);
            }
        };
        fetchRatings();
    }, [productId]);

    const total = Object.values(ratings).reduce((sum, count) => sum + count, 0);

    const getBarColor = (star) => {
        switch (star) {
            case 5: return 'bg-green-600';
            case 4: return 'bg-green-400';
            case 3: return 'bg-yellow-400';
            case 2: return 'bg-orange-400';
            case 1: return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };
    const handleClick = () => {
        navigate(`/product/${productId}/review`);
    }
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true)
            setProduct(null);
            setError(null);
            try {
                const response = await axiosInstance.get(`product/getProduct/${productId}`);
                console.log(response);
                setProduct(response.data);
            } catch (err) {
                const errorMessage = err.response?.data?.message || "";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        }

        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/product/recommend/${productId}`);
                setRecommendations(response.data.recommended || []);
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
                setRecommendations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
        fetchProduct();
    }, [productId])


    if (loading || !product) {
        return <LoadingSpinner asOverlay />;
    }

    return (
        <div className=''>
            <div className="bg-white p-4 flex flex-col md:flex-row gap-10">
                {error && <p className="text-red-500 text-center pb-4">{error}</p>} {/* Show operational errors */}
                <div className='flex flex-col gap-4 md:sticky md:top-10 h-fit'>
                    <ProductImageGallery images={product.imageUrl} productId={productId} />
                </div>
                <div className='flex-1'>
                    <div className='text-xl mb-2'>{product.title}</div>
                    <div className="inline-flex text-xs items-center font-medium bg-green-600 text-white px-2 py-1 rounded">
                        {product.rating.toFixed(1)}
                        <span className="ml-1">☆</span>
                    </div>
                    <div className='text-green-500 font-medium'>Extra ₹{product.mrp - product.price} off</div>
                    <div className="flex items-baseline space-x-2">
                        <div className="text-2xl font-bold text-gray-900">
                            ₹{product.price}
                        </div>
                        <div className="text-sm line-through text-gray-400">
                            ₹{product.mrp}
                        </div>
                    </div>
                    <DeliveryInfo />
                    <div className='flex items-center'>
                        <div className="text-sm font-medium text-gray-500 w-20">
                            Seller
                        </div>
                        <div className="text-sm font-bold text-blue-600">
                            {product.seller || "Unknown Seller"}
                        </div>
                    </div>
                    <div className='border border-gray-300 rounded p-4 mt-4'>
                        <div className="text-2xl font-semibold text-black">
                            Product Description
                        </div>
                        <HorizontalLine />
                        <div className="mt-5">
                            {product.description.map((block, index) => {
                                const isEven = index % 2 === 0;

                                return (
                                    <div key={index} className="space-y-2">
                                        {block.heading && (
                                            <h2 className="text-base font-semibold text-gray-800">{block.heading}</h2>
                                        )}
                                        <div
                                            className={`flex flex-col gap-4 ${block.image ? (isEven ? "md:flex-row" : "md:flex-row-reverse") : ""
                                                }`}
                                        >
                                            {block.text && (
                                                <p className="text-sm text-gray-700 flex-1">{block.text}</p>
                                            )}
                                            {block.image && (
                                                <img
                                                    src={block.image}
                                                    alt={`Image ${index}`}
                                                    className="w-50 object-cover rounded"
                                                />
                                            )}
                                        </div>
                                        {index !== product.description.length - 1 && <HorizontalLine />}
                                    </div>

                                );
                            })}
                        </div>
                    </div>

                    <div className='border border-gray-300 rounded p-4 mt-4'>
                        <div className="text-2xl font-semibold text-black">
                            Specifications
                        </div>
                        <HorizontalLine />
                        <div className="mt-5">
                            {product.specifications && product.specifications.length > 0 ? (
                                product.specifications.map((section, index) => (
                                    <div key={index} className="mb-6">
                                        <h3 className="text-lg font-semibold text-black mb-2">{section.heading}</h3>
                                        <table className="w-full text-sm text-gray-700 border-t border-b border-gray-200">
                                            <tbody>
                                                {section.specs.map((item, idx) => (
                                                    <tr key={idx} className="border-t border-gray-100">
                                                        <td className="py-2 pr-4 font-medium w-1/3">{item.key}</td>
                                                        <td className="py-2">{item.value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {index !== product.specifications.length - 1 && <HorizontalLine />}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No specifications available.</p>
                            )}
                        </div>
                    </div>
                    <div className='border border-gray-300 rounded p-4 mt-4'>
                        <div className='flex justify-between items-center'>
                            <div className='font-semibold text-2xl'>Ratings</div>
                            <button
                                className='p-2 border border-transparent bg-white shadow rounded-sm font-medium cursor-pointer hover:border hover:border-gray-400'
                                onClick={handleClick}>
                                Rate Product
                            </button>
                        </div>

                        <div className='flex align-center gap-3'>
                            <div className='flex flex-col justify-center'>
                                <div className='text-4xl'>{product.rating.toFixed(1)} {" "} ★</div>
                                <div className='text-gray-500'>{total + " "} Ratings </div>
                            </div>

                            <div className="w-full max-w-md space-y-2">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratings[star] || 0;
                                    const percent = total ? (count / total) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center space-x-2 text-sm">
                                            <span className="w-6 font-semibold">{star} ★</span>
                                            <div className="flex-1 h-2 bg-gray-200 rounded">
                                                <div
                                                    className={`${getBarColor(star)} h-full rounded`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-gray-700 text-right">{count.toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4">
                            <HorizontalLine />
                            {reviews.length === 0 ? (
                                <p>No reviews yet.</p>
                            ) : (
                                reviews.map((review, index) => (
                                    <div key={index} className="mb-4 p-3">
                                        <div className="flex items-center mb-2">
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
                                ))
                            )}
                            <button
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                                onClick={() => navigate(`/reviews/${productId}`)}
                            >
                                Show All Reviews
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* User History Section - Only for logged in users */}
            {isLoggedIn && userHistory.length > 0 && (
                <div className="bg-gray-50 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
                        {loadingHistory ? (
                            <LoadingSpinner centered />
                        ) : (
                            <div className="grid gap-4" style={{
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                maxWidth: '100%'
                            }}>
                                {userHistory.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => handleProductClick(item._id)}
                                        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                                    >
                                        <div className="aspect-square">
                                            <img
                                                src={getImageUrl(item) || placeholderImage}
                                                alt="Product"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    if (e.target.src !== placeholderImage) {
                                                        e.target.src = placeholderImage;
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Product Recommendations Section - For all users */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>

                    <Recommend recommendations={recommendations} />
                </div>
            </div>
        </div>
    );
};

export default Product;
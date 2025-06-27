import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios.js';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/UIElements/LoadingSpinner.jsx';
import SellerNavigation from '../components/Navigation/SellerNavigation';

function SellerStore() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/product/getProductsBySeller');
            setProducts(response.data.products);
            
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch products");
        }finally {
            setLoading(false);
        }
    };

    const calculateDiscount = (price, mrp) => {
        if (mrp > price) {
            return Math.round(((mrp - price) / mrp) * 100);
        }
        return 0;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SellerNavigation />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && <LoadingSpinner asOverlay />}
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                        <p className="text-gray-600 mt-2">Manage your product catalog</p>
                    </div>
                    <button
                        onClick={() => navigate('/seller/add-product')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 shadow-sm flex items-center gap-2"
                    >
                        <span>+</span>
                        Add Product
                    </button>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="text-gray-500 text-lg mb-4">No products found</div>
                        <p className="text-gray-600 mb-6">Start by adding your first product to your store</p>
                        <button
                            onClick={() => navigate('/seller/add-product')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                        >
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                {/* Product Image */}
                                <div className="p-4">
                                    <img
                                        src={product.imageUrl?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
                                        alt={product.title}
                                        className="w-full h-48 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="px-4 pb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {product.title}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-600 mb-1">
                                        Brand: <span className="font-medium">{product.brand}</span>
                                    </p>
                                    
                                    <p className="text-sm text-gray-600 mb-3">
                                        Category: <span className="font-medium">{product.category}</span>
                                    </p>

                                    {/* Price Section */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₹{product.price?.toLocaleString()}
                                        </span>
                                        {product.mrp > product.price && (
                                            <>
                                                <span className="text-sm text-gray-500 line-through">
                                                    ₹{product.mrp?.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-medium text-green-600">
                                                    {calculateDiscount(product.price, product.mrp)}% off
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-4">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < Math.floor(product.rating) 
                                                            ? 'text-yellow-400 fill-current' 
                                                            : 'text-gray-300'
                                                    }`}
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600 ml-1">
                                            {product.rating?.toFixed(1)} / 5
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/seller/edit-product/${product._id}`)}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => navigate(`/product/${product._id}`)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SellerStore;
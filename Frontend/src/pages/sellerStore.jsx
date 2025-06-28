import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios.js';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/UIElements/LoadingSpinner.jsx';
import SellerNavigation from '../components/Navigation/SellerNavigation';

function SellerStore() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [breakdownData, setBreakdownData] = useState(null);
    const [ordersData, setOrdersData] = useState([]);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const limit = 5;
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

    const getProductBreakdown = async (productId) => {
        setLoadingBreakdown(true);
        setLoadingOrders(true);
        try {
            // Fetch breakdown stats
            const statsResponse = await axiosInstance.get(`/product/${productId}/breakdown`);
            setBreakdownData(statsResponse.data.breakdown);
            setTotalPages(parseInt(statsResponse.data.breakdown.stats.totalOrders)/ limit);
            // Fetch orders for this product
            const ordersResponse = await axiosInstance.get(`/product/${productId}/orders?page=1&limit=${limit}`);
            setOrdersData(ordersResponse.data.orders);
            setCurrentPage(1);
            
            setShowBreakdown(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch product analytics");
        } finally {
            setLoadingBreakdown(false);
            setLoadingOrders(false);
        }
    };

    const loadMoreOrders = async (productId, page) => {
        setLoadingOrders(true);
        try {
            const ordersResponse = await axiosInstance.get(`/product/${productId}/orders?page=${page}&limit=5`);
            setOrdersData(ordersResponse.data.orders);
            setCurrentPage(page)
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoadingOrders(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const closeBreakdown = () => {
        setShowBreakdown(false);
        setBreakdownData(null);
        setOrdersData([]);
        setSelectedProduct(null);
        setCurrentPage(1);
        setTotalPages(1);
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
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                getProductBreakdown(product._id);
                                            }}
                                            className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                                        >
                                            Analytics
                                        </button>
                                        <button
                                            onClick={() => navigate(`/product/${product._id}`)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
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

            {/* Product Breakdown Modal */}
            {showBreakdown && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        {loadingBreakdown ? (
                            <div className="flex justify-center items-center h-64">
                                <LoadingSpinner />
                            </div>
                        ) : breakdownData ? (
                            <div className="mt-3">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Product Analytics</h3>
                                    <button
                                        onClick={closeBreakdown}
                                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                {/* Product Info */}
                                <div className="flex items-start space-x-4 mb-8 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        {breakdownData.productInfo.image ? (
                                            <img 
                                                className="h-24 w-24 rounded-lg object-cover" 
                                                src={breakdownData.productInfo.image} 
                                                alt={breakdownData.productInfo.title}
                                            />
                                        ) : (
                                            <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-semibold text-gray-900">{breakdownData.productInfo.title}</h4>
                                        <p className="text-gray-600">{breakdownData.productInfo.brand}</p>
                                        <p className="text-sm text-gray-500 mb-2">{breakdownData.productInfo.category}</p>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-lg font-bold text-gray-900">
                                                {formatCurrency(breakdownData.productInfo.price)}
                                            </span>
                                            {breakdownData.productInfo.mrp > breakdownData.productInfo.price && (
                                                <span className="text-sm text-gray-500 line-through">
                                                    {formatCurrency(breakdownData.productInfo.mrp)}
                                                </span>
                                            )}
                                            <span className="text-sm text-gray-600">
                                                Stock: {breakdownData.productInfo.currentStock} units
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-600">{breakdownData.stats.totalOrders}</div>
                                        <div className="text-sm text-blue-800">Total Orders</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">{breakdownData.stats.totalSales}</div>
                                        <div className="text-sm text-green-800">Successful Sales</div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-red-600">{breakdownData.stats.totalCancellations}</div>
                                        <div className="text-sm text-red-800">Cancellations</div>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {formatCurrency(breakdownData.stats.totalMoneyReceived)}
                                        </div>
                                        <div className="text-sm text-yellow-800">Total Revenue</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-purple-600">{breakdownData.stats.successRate}%</div>
                                        <div className="text-sm text-purple-800">Success Rate</div>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {formatCurrency(breakdownData.stats.averageOrderValue)}
                                        </div>
                                        <div className="text-sm text-indigo-800">Avg Order Value</div>
                                    </div>
                                </div>

                                {/* Order Details Table */}
                                <div className="bg-white">
                                    <h5 className="text-lg font-semibold text-gray-900 mb-4">Order History</h5>
                                    {loadingOrders ? (
                                        <div className="flex justify-center items-center h-32">
                                            <LoadingSpinner />
                                        </div>
                                    ) : ordersData.length > 0 ? (
                                        <>
                                            <div className="overflow-x-auto max-h-64">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50 sticky top-0">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {ordersData.map((order, index) => (
                                                            <tr key={order.orderId} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                                                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {formatDate(order.orderDate)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {formatCurrency(order.price)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                        order.paymentStatus === 'Paid' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : order.paymentStatus === 'Cancelled' || order.paymentStatus === 'Refunded'
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {order.paymentStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                        order.orderStatus === 'Order Delivered' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : order.orderStatus === 'Order Cancelled'
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : order.orderStatus === 'Order Shipped'
                                                                                    ? 'bg-blue-100 text-blue-800'
                                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {order.orderStatus}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                                                    <div className="flex flex-1 justify-between sm:hidden">
                                                        <button
                                                            onClick={() => currentPage > 1 && loadMoreOrders(selectedProduct._id, currentPage - 1)}
                                                            disabled={currentPage <= 1}
                                                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            Previous
                                                        </button>
                                                        <button
                                                            onClick={() => currentPage < totalPages && loadMoreOrders(selectedProduct._id, currentPage + 1)}
                                                            disabled={currentPage >= totalPages}
                                                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm text-gray-700">
                                                                Page <span className="font-medium">{currentPage}</span> of{' '}
                                                                <span className="font-medium">{totalPages}</span>
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                                <button
                                                                    onClick={() => currentPage > 1 && loadMoreOrders(selectedProduct._id, currentPage - 1)}
                                                                    disabled={currentPage <= 1}
                                                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                                                >
                                                                    <span className="sr-only">Previous</span>
                                                                    ←
                                                                </button>
                                                                
                                                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                                                    const pageNum = Math.max(1, currentPage - 2) + i;
                                                                    if (pageNum <= totalPages) {
                                                                        return (
                                                                            <button
                                                                                key={pageNum}
                                                                                onClick={() => loadMoreOrders(selectedProduct._id, pageNum)}
                                                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                                                    pageNum === currentPage
                                                                                        ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                                                }`}
                                                                            >
                                                                                {pageNum}
                                                                            </button>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })}
                                                                
                                                                <button
                                                                    onClick={() => currentPage < totalPages && loadMoreOrders(selectedProduct._id, currentPage + 1)}
                                                                    disabled={currentPage >= totalPages}
                                                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                                                >
                                                                    <span className="sr-only">Next</span>
                                                                    →
                                                                </button>
                                                            </nav>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No orders found for this product</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );  
}

export default SellerStore;
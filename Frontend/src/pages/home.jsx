import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import { useUserAuthStore } from '../store/userAuth.store';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import { Search, ShoppingCart, Truck, Shield, RefreshCw, Star, Store, User } from 'lucide-react';

export default function HomePage() {
  const { authUser } = useUserAuthStore();
  const isLoggedIn = !!authUser;
  const navigate = useNavigate();
  
  const [userHistory, setUserHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Electronics", icon: "📱", color: "bg-blue-100 text-blue-600" },
    { name: "Appliances", icon: "🏠", color: "bg-green-100 text-green-600" },
    { name: "Mobiles", icon: "📞", color: "bg-purple-100 text-purple-600" },
    { name: "Toys", icon: "🧸", color: "bg-pink-100 text-pink-600" },
    { name: "Books", icon: "📚", color: "bg-orange-100 text-orange-600" },
    { name: "Food", icon: "🍎", color: "bg-red-100 text-red-600" },
    { name: "Furniture", icon: "🪑", color: "bg-yellow-100 text-yellow-600" },
    { name: "Medicines", icon: "💊", color: "bg-indigo-100 text-indigo-600" }
  ];

  useEffect(() => {
    const syncLocalCart = async () => {
      const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      console.log(storedCart);
      for (const item of storedCart) {
        if (item.id && item.qty) {
          try {
            await axiosInstance.post(`/cart/add/${item.id}`, {
              quantity: item.qty,
            });
          } catch (err) {
            console.error(`Failed to sync product ${item.id}`, err);
          }
        }
      }
      localStorage.removeItem("cartItems");
    };

    if (isLoggedIn) {
      syncLocalCart();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isLoggedIn) {
          // Fetch user history
          const historyResponse = await axiosInstance.get('/user/user-history');
          console.log('User history:', historyResponse.data);
          setUserHistory(historyResponse.data.history || []);

          // Fetch recommendations based on first item in history
          if (historyResponse.data.history && historyResponse.data.history.length > 0) {
            const firstProductId = historyResponse.data.history[0]._id;
            try {
              const recResponse = await axiosInstance.get(`/product/recommend/${firstProductId}`);
              console.log('Recommendations:', recResponse.data);
              setRecommendations(recResponse.data.recommended || []);
            } catch (error) {
              console.error('Failed to fetch recommendations:', error);
              setRecommendations([]);
            }
          }
        } else {
          // Fetch trending products for non-logged in users
          const trendingResponse = await axiosInstance.get('/product/trending');
          console.log('Trending products:', trendingResponse.data);
          setTrendingProducts(trendingResponse.data.trending || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/search?q=${category}`);
  };

  const calculateDiscount = (price, mrp) => {
    if (mrp > price) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const getImageUrl = (item) => {
    // Handle different data structures
    if (item.image) {
      return item.image;
    }
    if (item.imageUrl && item.imageUrl[0]) {
      return item.imageUrl[0];
    }
    return null; // Return null instead of placeholder URL
  };

  // Simple SVG placeholder as data URI
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='75' y='75' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

  if (loading) {
    return <LoadingSpinner asOverlay />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to CartShope
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {isLoggedIn 
              ? `Hello ${authUser?.username || 'User'}! Discover products tailored just for you.`
              : "Your one-stop destination for quality products. Sign in for personalized recommendations."
            }
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={() => navigate('/search')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Browse Products
            </button>
            {!isLoggedIn && (
              <button 
                onClick={() => navigate('/user/login')}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                Sign In
              </button>
            )}
          </div>

          {/* Seller Section */}
         {!isLoggedIn && <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Store className="w-6 h-6" />
                  Are you a Seller?
                </h3>
                <p className="text-blue-100 mb-4">
                  Join thousands of sellers and start selling your products nationwide. 
                  Get access to powerful tools, analytics, and a growing customer base.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => navigate('/seller/login')}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Store className="w-5 h-5" />
                    Seller Login
                  </button>
                  <button 
                    onClick={() => navigate('/seller/signup')}
                    className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Become a Seller
                  </button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold">10K+</div>
                      <div className="text-blue-100">Active Sellers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">50K+</div>
                      <div className="text-blue-100">Products Sold</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">95%</div>
                      <div className="text-blue-100">Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-blue-100">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>  }
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <div
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow text-center"
              >
                <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center text-2xl mx-auto mb-2`}>
                  {category.icon}
                </div>
                <p className="text-sm font-medium text-gray-900">{category.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose CartShope?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Quick and reliable shipping to your doorstep</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Shopping</h3>
              <p className="text-sm text-gray-600">Your data and payments are protected</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-sm text-gray-600">Hassle-free return process</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Products</h3>
              <p className="text-sm text-gray-600">Curated selection of trusted brands</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {isLoggedIn ? (
          // Logged in user - show history and recommendations
          <div className="space-y-8">
            {/* User History Section */}
            {userHistory.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
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
              </div>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
                <div className="grid gap-4" style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    maxWidth: '100%'
                }}>
                  {recommendations.map((item) => (
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
              </div>
            )}

            {userHistory.length === 0 && recommendations.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">Start Your Shopping Journey</h3>
                <p className="text-gray-500 mb-6">Browse our categories and discover amazing products.</p>
                <button 
                  onClick={() => navigate('/search')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Explore Products
                </button>
              </div>
            )}
          </div>
        ) : (
          // Non-logged in user - show trending products
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Products</h2>
            {trendingProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {trendingProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square">
                      <img
                        src={getImageUrl(product) || placeholderImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (e.target.src !== placeholderImage) {
                            e.target.src = placeholderImage;
                          }
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2">{product.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-base font-bold text-gray-900">₹{product.price}</span>
                          {product.mrp > product.price && (
                            <>
                              <span className="text-xs text-gray-500 line-through">₹{product.mrp}</span>
                              <span className="text-xs text-green-600 font-medium">
                                {calculateDiscount(product.price, product.mrp)}% off
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 capitalize">{product.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">Discover Amazing Products</h3>
                <p className="text-gray-500 mb-6">Browse our categories to find what you're looking for.</p>
                <button 
                  onClick={() => navigate('/search')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
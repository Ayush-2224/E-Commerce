import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import { useUserAuthStore } from '../store/userAuth.store';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import { Search, ShoppingCart, Truck, Shield, RefreshCw, Star, Store, User } from 'lucide-react';
import Recommend from '../components/UIElements/Recommend';

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
          // Fetch user history
          const historyResponse = await axiosInstance.get('/user/user-history');
          console.log('User history:', historyResponse.data);
          setUserHistory(historyResponse.data.history || []);
          const recResponse = await axiosInstance.get(`/product/recommendUser`);
          console.log('Recommendations:', recResponse.data);
          setRecommendations(recResponse.data.recommended || []);
        const trendingResponse = await axiosInstance.get('/product/trending');
        console.log('Trending products:', trendingResponse.data);
        setTrendingProducts(trendingResponse.data.trending || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <div className="space-y-8">
            {/* User History Section */}
            

            {/* Recommendations Section */}
            {recommendations  && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
                  <Recommend recommendations={recommendations} />
              </div>
            )}

            {recommendations.length === 0 && (
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Products</h2>
            {trendingProducts.length > 0 ? (
              <div>
              <Recommend recommendations={trendingProducts}/>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">Discover Amazing Products</h3>
                <p className="text-gray-500 mb-6">Browse our categories to find what you're looking for.</p>
                <button 
                  onClick={() => navigate('/search')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                </button>
              </div>
            )}

            {userHistory.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
                        <Recommend recommendations={userHistory} />
                </div>
            )}
          </div>
      </div>
    </div>
  );
}
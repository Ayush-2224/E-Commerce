import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSellerAuthStore } from '../store/sellerAuth.store';
import { axiosInstance } from '../lib/axios';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import SellerNavigation from '../components/Navigation/SellerNavigation';
import { 
  Plus, 
  Package, 
  DollarSign, 
  Star, 
  ShoppingCart,
  Settings
} from 'lucide-react';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { authSeller, checkAuth } = useSellerAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        // Check authentication first
        if (!authSeller) {
          await checkAuth();
          return;
        }
        // Fetch seller's products
        const productsResponse = await axiosInstance.get('/product/seller-products');
        const products = productsResponse.data.products || [];
        // Fetch seller's orders
        const ordersResponse = await axiosInstance.get('/order/seller-orders');
        const orders = ordersResponse.data.orders || [];
        // Calculate statistics
        const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
        const averageRating = products.length > 0 
          ? products.reduce((sum, product) => sum + (product.rating || 0), 0) / products.length 
          : 0;
        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          averageRating: averageRating.toFixed(1)
        });
        // Get top products (by views or sales)
        const sortedProducts = products.sort((a, b) => (b.views || 0) - (a.views || 0));
        setTopProducts(sortedProducts.slice(0, 5));
      } catch (error) {
        setError('Failed to load dashboard data. Please log in again.');
      } finally {
        setLoading(false);
      }
    };
    initializeDashboard();
  }, [authSeller, checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SellerNavigation />
        <LoadingSpinner asOverlay />
      </div>
    );
  }

  if (error || !authSeller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SellerNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
            <button
              onClick={() => navigate('/seller/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'List a new product in your store',
      icon: Plus,
      color: 'bg-blue-500',
      action: () => navigate('/seller/add-product')
    },
    {
      title: 'View Orders',
      description: 'Check and manage your orders',
      icon: ShoppingCart,
      color: 'bg-green-500',
      action: () => navigate('/seller/orders')
    },
    {
      title: 'Edit Profile',
      description: 'Update your store information',
      icon: Settings,
      color: 'bg-orange-500',
      action: () => navigate('/seller/profile')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {authSeller?.username}!</h1>
          <p className="text-gray-600">Here's what's happening with your store today.</p>
        </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalOrders.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
          </div>
          <div className="p-6">
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={product.imageUrl?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="%23f3f4f6"/%3E%3Ctext x="25" y="25" font-family="Arial" font-size="8" fill="%236b7280" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{product.title}</p>
                      <p className="text-sm text-gray-600">₹{product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{product.views || 0} views</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{product.rating || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No products yet</p>
                <p className="text-sm text-gray-500">Add your first product to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

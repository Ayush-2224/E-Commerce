import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios.js';
import { Star, ShoppingCart } from 'lucide-react';

const Recommend = ({ recommendations }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateDiscount = (price, mrp) => {
    if (mrp > price) {
      return Math.round(((mrp - price) / mrp) * 100);
    }
    return 0;
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-64 bg-gray-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {recommendations.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleProductClick(product._id)}
            >
              {/* Product Image */}
              <div className="p-4">
                <img
                  src={product.imageUrl?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="px-4">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[1.5rem]">
                  {product.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">
                    {(product.rating || 0).toFixed(1)}
                  </span>
                </div>

                {/* Price Section */}
                <div className="mb-3">
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.mrp)}
                      </span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </span>
                  {product.mrp > product.price && (
                    <span className="text-sm font-medium text-green-600">
                      {calculateDiscount(product.price, product.mrp)}% off
                    </span>
                  )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicators */}
        <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 cursor-pointer hover:bg-gray-50 transition-colors"
             onClick={() => document.querySelector('.flex.space-x-4.overflow-x-auto').scrollBy({ left: -256, behavior: 'smooth' })}>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        
        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 cursor-pointer hover:bg-gray-50 transition-colors"
             onClick={() => document.querySelector('.flex.space-x-4.overflow-x-auto').scrollBy({ left: 256, behavior: 'smooth' })}>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Recommend;

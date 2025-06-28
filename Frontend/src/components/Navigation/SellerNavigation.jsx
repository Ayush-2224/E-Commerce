import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSellerAuthStore } from '../../store/sellerAuth.store';
import { 
  Package, 
  Plus, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Store, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const SellerNavigation = () => {
  const navigate = useNavigate();
  const { authSeller, logout } = useSellerAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/seller/dashboard',
      icon: BarChart3,
      description: 'Overview of your store'
    },
    {
      name: 'Add Product',
      href: '/seller/add-product',
      icon: Plus,
      description: 'List new products'
    },
    {
      name: 'My Products',
      href: '/seller/store',
      icon: Package,
      description: 'Manage your products'
    },
    {
      name: 'Orders',
      href: '/seller/orders',
      icon: ShoppingCart,
      description: 'View and manage orders'
    },
    {
      name: 'Profile',
      href: '/seller/profile',
      icon: Settings,
      description: 'Edit your profile'
    }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Seller Portal</h1>
                <p className="text-sm text-gray-600">{authSeller?.username}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                View Store
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Seller Portal</h1>
                <p className="text-xs text-gray-600">{authSeller?.username}</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="py-4 border-t border-gray-100">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </NavLink>
                ))}
                
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    <Store className="w-5 h-5" />
                    View Store
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default SellerNavigation; 
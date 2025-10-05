// src/components/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, User, Menu, X, MessageCircle, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    if (!user) return navigate('/login');
    if (user.role === 'student') navigate('/student-dashboard');
    else if (user.role === 'landlord') navigate('/landlord-dashboard?tab=overview');
    setMobileMenuOpen(false);
  };

  // Transparent header for home page when not logged in
  const headerStyle = !user && isHomePage 
    ? "bg-transparent absolute top-0 left-0 right-0 z-50 text-white"
    : "bg-white shadow-sm relative";

  const linkStyle = !user && isHomePage
    ? "text-white/90 hover:text-white font-medium transition-colors"
    : "text-gray-700 hover:text-purple-600 transition-colors";

  const logoStyle = !user && isHomePage
    ? "text-white"
    : "text-purple-600";

  return (
    <header className={headerStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          {user ? (
            <div className="flex items-center space-x-3 cursor-default select-none" aria-label="SecureStays">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SecureStays
              </span>
            </div>
          ) : (
            <Link to="/" className="flex items-center space-x-3 group">
              <div className={`w-10 h-10 ${isHomePage ? 'bg-white/20' : 'bg-gradient-to-br from-purple-600 to-pink-600'} rounded-lg flex items-center justify-center transition-all group-hover:scale-110`}>
                <Home className={`h-6 w-6 ${isHomePage ? 'text-white' : 'text-white'}`} />
              </div>
              <span className={`text-2xl font-bold ${isHomePage ? 'text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'}`}>
                SecureStays
              </span>
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-8">
              {user?.role === 'student' && (
                <>
                  <Link to="/find-homes" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                    Find Homes
                  </Link>
                  <Link to="/chatbot" className="text-gray-700 hover:text-purple-600 font-medium transition-colors flex items-center">
                    <Sparkles className="h-4 w-4 mr-1" /> AI Assistant
                  </Link>
                  <Link to="/chat" className="text-gray-700 hover:text-purple-600 font-medium transition-colors flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" /> Chat
                  </Link>
                </>
              )}
              {user?.role === 'landlord' && (
                <>
                  <Link to="/landlord-dashboard?tab=properties" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                    List Your Property
                  </Link>
                  <Link to="/chat" className="text-gray-700 hover:text-purple-600 font-medium transition-colors flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" /> Chat
                  </Link>
                </>
              )}
              {!user && (
                <>
                  <Link to="/find-homes" className={linkStyle}>
                    Browse Properties
                  </Link>
                  <Link to="/help" className={linkStyle}>
                    Support
                  </Link>
                </>
              )}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button 
                    onClick={handleDashboard} 
                    className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
                  >
                    Dashboard
                  </button>
                  <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="hidden lg:block font-medium">{user.name}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className={`px-5 py-2 font-semibold rounded-lg transition-all ${
                      isHomePage 
                        ? 'border-2 border-white text-white hover:bg-white hover:text-purple-600' 
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}>
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className={`px-5 py-2 font-semibold rounded-lg transition-all ${
                      isHomePage
                        ? 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105'
                    }`}>
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button 
            className={`md:hidden ${isHomePage && !user ? 'text-white' : 'text-gray-700'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-xl z-50 border-t">
          <div className="px-4 py-4 space-y-3">
            {user?.role === 'student' && (
              <>
                <Link 
                  to="/find-homes" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Find Homes
                </Link>
                <Link 
                  to="/chatbot" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  <Sparkles className="inline h-4 w-4 mr-2" />
                  AI Assistant
                </Link>
                <Link 
                  to="/chat" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  <MessageCircle className="inline h-4 w-4 mr-2" />
                  Chat
                </Link>
              </>
            )}
            {user?.role === 'landlord' && (
              <>
                <Link 
                  to="/landlord-dashboard?tab=properties" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  List Your Property
                </Link>
                <Link 
                  to="/chat" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  <MessageCircle className="inline h-4 w-4 mr-2" />
                  Chat
                </Link>
              </>
            )}
            {!user && (
              <>
                <Link 
                  to="/find-homes" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Browse Properties
                </Link>
                <Link 
                  to="/help" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Support
                </Link>
              </>
            )}

            {user ? (
              <div className="space-y-3 border-t pt-4 mt-4">
                <button 
                  onClick={handleDashboard} 
                  className="block w-full text-left py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Dashboard
                </button>
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3 border-t pt-4 mt-4">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    Login
                  </button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
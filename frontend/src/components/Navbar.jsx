import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Building, LayoutDashboard, User as UserIcon, ChevronDown, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/85 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center w-1/4">
            <Link to="/" className="flex items-center space-x-2 text-gray-900 transition-colors">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">EstateFlow</span>
            </Link>
          </div>
          {/* Nav Links & Profile */}
          <div className="flex items-center justify-end w-3/4 space-x-4">
            {user ? (
              <div className="flex items-center gap-6 w-full justify-end">
                {/* Center Links (pushed towards center-right visually) */}
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/${user.role.toLowerCase()}-dashboard`} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                      location.pathname.includes('dashboard') 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/properties" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                      location.pathname.includes('/properties') || location.pathname.includes('/property')
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    Properties
                  </Link>
                  {(user.role === 'Owner' || user.role === 'Admin') && (
                    <>
                      <Link 
                        to="/reports" 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                          location.pathname.includes('/reports') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Reports
                      </Link>
                      <Link 
                        to="/tenants" 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                          location.pathname.includes('/tenants') 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Tenants
                      </Link>
                    </>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative ml-4" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-800">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary text-white hover:bg-blue-800 px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

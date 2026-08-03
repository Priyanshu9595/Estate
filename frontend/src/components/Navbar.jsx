import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Building, LayoutDashboard, User as UserIcon, ChevronDown, LogOut, Menu, X, CreditCard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    setShowDropdown(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-btn')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = user ? [
    { name: 'Dashboard', path: `/${user.role.toLowerCase()}-dashboard`, icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: 'Properties', path: '/properties', icon: <Building className="h-4 w-4" /> },
    ...(user.role === 'User' ? [
      { name: 'Payment History', path: '/user-dashboard?tab=History', icon: <CreditCard className="h-4 w-4" /> }
    ] : []),
    ...(user.role === 'Owner' || user.role === 'Admin' ? [
      { name: 'Reports', path: '/reports' },
      { name: 'Tenants', path: '/tenants' }
    ] : []),
    ...(user.role === 'Owner' ? [
      { name: 'Admins', path: '/admins' }
    ] : [])
  ] : [];

  return (
    <nav className="bg-white/85 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-gray-900 transition-colors">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight hidden sm:block">EstateFlow</span>
            </Link>
          </div>

          {/* Desktop Nav Links & Profile */}
          <div className="hidden lg:flex items-center justify-end flex-1 space-x-4">
            {user ? (
              <div className="flex items-center gap-6 justify-end">
                {/* Desktop Links */}
                <div className="flex items-center gap-2">
                  {navLinks.map((link, idx) => (
                    <Link 
                      key={idx}
                      to={link.path} 
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        (link.path.includes('?') ? location.pathname + location.search === link.path : location.pathname.includes(link.path) && location.search === '') 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
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

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn text-gray-600 hover:text-primary focus:outline-none p-2"
            >
              {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 shadow-md absolute w-full left-0 right-0 z-40" ref={mobileMenuRef}>
          <div className="px-4 pt-4 pb-6 space-y-3">
            {user ? (
              <>
                {/* Mobile User Info */}
                <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-xl">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{user.role}</p>
                  </div>
                </div>
                
                {/* Mobile Links */}
                {navLinks.map((link, idx) => (
                  <Link 
                    key={idx}
                    to={link.path} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                      (link.path.includes('?') ? location.pathname + location.search === link.path : location.pathname.includes(link.path) && location.search === '') 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
                
                <hr className="border-gray-100 my-2" />
                
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center gap-3"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" className="block text-center px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors">
                  Login
                </Link>
                <Link to="/register" className="block text-center px-4 py-3 bg-primary text-white hover:bg-blue-800 rounded-xl font-bold transition-colors shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

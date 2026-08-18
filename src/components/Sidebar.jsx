import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Building, LayoutDashboard, User as UserIcon, LogOut, Menu, X } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-btn')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = user ? [
    { name: 'Dashboard', path: `/${user.role.toLowerCase()}-dashboard`, icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Properties', path: '/properties', icon: <Building className="h-5 w-5" /> },
    ...(user.role === 'Owner' || user.role === 'Admin' ? [
      { name: 'Reports', path: '/reports', icon: <LayoutDashboard className="h-5 w-5" /> }, // Consider changing icon
      { name: 'Tenants', path: '/tenants', icon: <UserIcon className="h-5 w-5" /> }
    ] : []),
    ...(user.role === 'Owner' ? [
      { name: 'Admins', path: '/admins', icon: <UserIcon className="h-5 w-5" /> }
    ] : [])
  ] : [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/85 backdrop-blur-md border-r border-gray-100 shadow-sm w-64">
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-3 text-gray-900 transition-colors">
          <div className="bg-primary text-white p-2 rounded-xl">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">EstateFlow</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navLinks.map((link, idx) => {
          const isActive = location.pathname.includes(link.path);
          return (
            <Link 
              key={idx}
              to={link.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                {link.icon}
              </div>
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 font-medium">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-40 shadow-sm">
        <Link to="/" className="flex items-center space-x-2 text-gray-900">
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">EstateFlow</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="mobile-menu-btn text-gray-600 hover:text-primary focus:outline-none p-2"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl" ref={mobileMenuRef}>
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-black/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;

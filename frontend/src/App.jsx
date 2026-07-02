import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import UserDashboard from './pages/UserDashboard';
import PropertiesList from './pages/PropertiesList';
import PropertyDetails from './pages/PropertyDetails';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Reports from './pages/Reports';
import TenantList from './pages/TenantList';
import Chatbot from './components/Chatbot';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}-dashboard`} /> : <Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Protected Routes */}
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/owner-dashboard" element={<ProtectedRoute allowedRoles={['Owner']}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={['User']}><UserDashboard /></ProtectedRoute>} />
            <Route path="/properties" element={<ProtectedRoute allowedRoles={['Admin', 'Owner', 'User']}><PropertiesList /></ProtectedRoute>} />
            <Route path="/property/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Owner', 'User']}><PropertyDetails /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin', 'Owner']}><Reports /></ProtectedRoute>} />
            <Route path="/tenants" element={<ProtectedRoute allowedRoles={['Admin', 'Owner']}><TenantList /></ProtectedRoute>} />
            {/* Future routes: /users, /rent, /maintenance */}
          </Routes>
        </main>
        {user && <Chatbot />}
      </div>
    </Router>
  );
}

export default App;

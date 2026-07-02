import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User'); // Default Role
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const user = await login(email.trim(), password, role);
      navigate(`/${user.role.toLowerCase()}-dashboard`);
    } catch (err) {
      console.error("LOGIN ERROR CAUGHT:", err);
      setError(typeof err === 'string' ? err : err?.message || JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-surface p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to your EstateFlow account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">Login As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
            >
              <option value="User">As a User (Tenant)</option>
              <option value="Admin">As an Admin</option>
              <option value="Owner">As an Owner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary transition-colors outline-none text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary transition-colors outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

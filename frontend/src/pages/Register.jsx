import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState('User'); // Default Role
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const user = await register({ name, email, phone, password, role });
      navigate(`/${user.role.toLowerCase()}-dashboard`);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="bg-surface p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join EstateFlow today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary transition-colors outline-none text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
            <label className="block text-sm font-semibold text-secondary mb-2">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary transition-colors outline-none text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

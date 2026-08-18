import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* Left Image Section */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 bg-slate-50 overflow-hidden border-r border-slate-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>

        {/* Background blobs */}
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-200/40 blur-3xl"></div>
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-3xl"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-center max-w-lg">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] border border-white/80 mb-10 bg-white">
            <img
              src="/hero_3d.png"
              alt="3D Building"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

            {/* Overlay content on image */}
            <div className="absolute bottom-0 left-0 w-full p-8 text-white">
              <h3 className="text-3xl font-bold mb-2">Smart Dashboard</h3>
              <p className="text-white/90 font-medium text-sm leading-relaxed">Manage all your properties from a single, powerful dashboard with complete transparency.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-black text-primary mb-1">14 Days</div>
              <div className="text-sm text-slate-600 font-bold">Free trial, no credit card required</div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-black text-primary mb-1">100%</div>
              <div className="text-sm text-slate-600 font-bold">Secure and transparent process</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="max-w-md w-full">
          {/* Back to Home Link */}
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-2 font-medium">Join EstateFlow today and simplify your property management.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 mt-6 active:scale-[0.98]"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center lg:text-left text-gray-600 text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-blue-800 font-bold transition-colors">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

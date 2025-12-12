import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2 } from 'lucide-react'; // Added Loader icon
import api from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the Real Backend
      const response = await api.post('/login', { email, password });
      
      const user = response.data;
      
      // Store real user data
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_name', user.full_name);
      
      // Redirect based on role
      if (user.role === 'teacher') {
        navigate('/dashboard');
      } else if (user.role === 'student') {
        navigate('/student-dashboard'); // We'll build this later
      } else {
        navigate('/admin');
      }

    } catch (err) {
      console.error("Login failed", err);
      // Show error message from backend or default
      setError(err.response?.data?.detail || "Login failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side (Design preserved) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-center px-12 text-white relative overflow-hidden">
         {/* ... (Same design code as before) ... */}
         <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <GraduationCap size={32} />
            </div>
            <span className="text-2xl font-bold tracking-wide">EduPredict</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">Empowering Schools <br/> with Predictive Insights</h1>
          <p className="text-blue-100 text-lg max-w-md">Identify at-risk students early and make data-driven decisions.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" placeholder="Enter your email" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                type="password" placeholder="Enter your password" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing In...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Try Demo Account</p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded inline-block">
              teacher@demo.com / dummyhash123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
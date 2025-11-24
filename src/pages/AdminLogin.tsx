import { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import { adminLogin } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import logo from '../images/Niko Free Logo.png';

interface AdminLoginProps {
  onNavigate: (page: string) => void;
}

export default function AdminLogin({ onNavigate }: AdminLoginProps) {
  const { setAuthData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await adminLogin({
        email: email.trim().toLowerCase(),
        password,
        keep_logged_in: keepLoggedIn,
      });

      if (response.access_token && response.user) {
        setAuthData(response.user, response.access_token);
        onNavigate('admin-dashboard');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="Niko Free Logo" 
              className="h-16 w-auto"
            />
          </div>
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#27aae2] to-[#1e8bb8] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4 flex items-start space-x-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nikofree.com"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#27aae2] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#27aae2] focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Keep Logged In */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4 text-[#27aae2] border-gray-300 rounded focus:ring-[#27aae2]"
              />
              <label htmlFor="keepLoggedIn" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-3.5 text-white rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-[1.02]'
              }`}
              style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This is a secure admin area. All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => onNavigate('landing')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#27aae2] transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}


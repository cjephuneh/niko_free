import { X, Mail, Eye, EyeOff, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { register, login, forgotPassword, partnerLogin, googleLogin } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Google Client ID
const GOOGLE_CLIENT_ID = '1073896486118-9a3r6v5ek96l7gmai05de9mkt1pmo9f2.apps.googleusercontent.com';

// TypeScript declarations for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: any) => void }) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export default function LoginModal({ isOpen, onClose, onNavigate }: LoginModalProps) {
  const { setAuthData } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Default to Log In
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [keepMeLoggedIn, setKeepMeLoggedIn] = useState(true); // Default to checked
  // Partner login state (moved from PartnerLoginModal)
  const [showPartnerLogin, setShowPartnerLogin] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [partnerShowPassword, setPartnerShowPassword] = useState(false);
  const [partnerIsLoading, setPartnerIsLoading] = useState(false);
  const [partnerError, setPartnerError] = useState('');
  // Privacy and Terms modals
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Ref for Google button container - MUST be before early return
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);

  // Define handleGoogleSignIn before useEffect to avoid reference errors
  const handleGoogleSignIn = async (response: any) => {
    try {
      setIsLoading(true);
      setError('');

      // Call backend with the credential token
      const loginResponse = await googleLogin(response.credential);

      // Update AuthContext
      if (loginResponse.access_token && loginResponse.user) {
        setAuthData(loginResponse.user, loginResponse.access_token);
      }

      // Close modal and show success message
      onClose();
      toast.success('Logged in successfully with Google!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Google login error:', err);
      setError((err as Error).message || 'Google login failed. Please try again.');
      toast.error('Google login failed. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load Google Identity Services with fallback for FedCM issues
  useEffect(() => {
    if (!isOpen) return;

    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Script already loaded, just initialize
      initializeGoogleSignIn();
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleSignIn();
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
      toast.error('Failed to load Google Sign-In. Please check your connection.', {
        position: 'top-right',
        autoClose: 3000,
      });
    };
    document.head.appendChild(script);
  }, [isOpen]);

  const initializeGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      try {
        // Log current origin for debugging
        console.log('Initializing Google Sign-In with origin:', window.location.origin);
        
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          // Note: FedCM will become mandatory soon, so we don't disable it
        });
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    }
  };

  // Render Google button when modal opens and script is loaded
  useEffect(() => {
    if (!isOpen || !googleButtonRef.current) return;

    // Clear any existing button
    googleButtonRef.current.innerHTML = '';
    setGoogleButtonRendered(false);

    if (window.google && window.google.accounts) {
      try {
        console.log('Rendering Google button from origin:', window.location.origin);
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: '100%',
          type: 'standard',
        });
        // Check if button was rendered after a short delay
        setTimeout(() => {
          if (googleButtonRef.current && googleButtonRef.current.children.length > 0) {
            console.log('Google button rendered successfully');
            setGoogleButtonRendered(true);
          } else {
            console.warn('Google button did not render. Check Google Console configuration.');
          }
        }, 500);
      } catch (error) {
        console.error('Error rendering Google button:', error);
        setGoogleButtonRendered(false);
        toast.error('Failed to render Google Sign-In button. Please check your Google Console configuration.', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    }
  }, [isOpen]);

  // Early return must be AFTER all hooks
  if (!isOpen) return null;

  const handleGoogleButtonClick = async () => {
    // Use redirect-based OAuth flow that works even with FedCM disabled
    // This approach doesn't require FedCM and works in all browsers
    
    try {
      const redirectUri = encodeURIComponent(window.location.origin);
      const scope = encodeURIComponent('openid email profile');
      const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Store nonce and redirect info for verification
      sessionStorage.setItem('google_oauth_nonce', nonce);
      sessionStorage.setItem('google_oauth_redirect', window.location.href);
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=id_token&scope=${scope}&nonce=${nonce}&prompt=select_account`;
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Google OAuth:', error);
      toast.error('Failed to start Google Sign-In. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      handleGoogleButtonClick();
    } else {
      console.log(`Login with ${provider}`);
      // Handle other social login logic here
    }
  };

  const handleEmailLogin = () => {
    setShowEmailModal(true);
  };

  // Fixed lint errors and ensured proper usage of Toastify
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up validation
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters');
          setIsLoading(false);
          return;
        }

        // Prepare registration data
        const registrationData = {
          email: email.trim().toLowerCase(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phoneNumber.trim() || undefined,
        };

        console.log('Sending registration data:', {
          email: registrationData.email,
          first_name: registrationData.first_name,
          last_name: registrationData.last_name,
        });

        // Call register API
        const registerResponse = await register(registrationData);

        // Update AuthContext
        if (registerResponse.access_token && registerResponse.user) {
          setAuthData(registerResponse.user, registerResponse.access_token);
        }

        console.log('Registration successful');
      } else {
        // Call login API
        const loginResponse = await login({
          email: email.trim().toLowerCase(),
          password,
        });

        // Update AuthContext
        if (loginResponse.access_token && loginResponse.user) {
          setAuthData(loginResponse.user, loginResponse.access_token);
        }

        console.log('Login successful');
      }

      // Close modal and show success message using Toastify
      setShowEmailModal(false);
      onClose();
      toast.success('Logged in successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Auth error:', err);
      setError((err as Error).message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmail('');
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await forgotPassword(forgotPasswordEmail.trim().toLowerCase());
      setResetEmailSent(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setError('');
    setResetEmailSent(false);
    setIsLoading(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {!showEmailModal && (
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
            onClick={onClose}
          ></div>

          {/* Center modal */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">Quick Sign In</h2>
              
              {/* Subtitle */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Join events, get recommendations based on your interest. Find where your friends are going.
              </p>

              {/* Social login buttons */}
              <div className="space-y-3 mb-6">
                {/* Facebook */}
                {/* <button 
                  onClick={() => handleSocialLogin('Facebook')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Facebook</span>
                </button> */}

                {/* Apple */}
                {/* <button 
                  onClick={() => handleSocialLogin('Apple')}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Apple</span>
                </button> */}

                {/* Google - Show custom button by default, hide when Google's button renders */}
                {!googleButtonRendered && (
                  <button 
                    onClick={handleGoogleButtonClick}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Google</span>
                  </button>
                )}
                
                {/* Google's button container - hidden until Google button renders */}
                <div 
                  ref={googleButtonRef}
                  className={`w-full flex justify-center ${googleButtonRendered ? '' : 'hidden'}`}
                  style={{ minHeight: '40px' }}
                >
                  {/* Google button will be rendered here */}
                </div>

                {/* Email */}
                <button 
                  onClick={handleEmailLogin}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Email</span>
                </button>
              </div>

              {/* Keep Me Logged In Checkbox */}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="keepMeLoggedIn"
                  checked={keepMeLoggedIn}
                  onChange={(e) => setKeepMeLoggedIn(e.target.checked)}
                  className="w-4 h-4 text-[#27aae2] border-gray-300 rounded focus:ring-[#27aae2] focus:ring-2"
                />
                <label htmlFor="keepMeLoggedIn" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Keep me logged in
                </label>
              </div>

              {/* OR divider + Partner Login */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <div className="px-3 text-xs text-gray-400">OR</div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    // Open partner login modal inside this component
                    setShowPartnerLogin(true);
                  }}
                  className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border border-[#27aae2] text-[#27aae2] rounded-xl font-medium hover:bg-[#27aae2]/10 transition-colors"
                >
                  Partner Login
                </button>
              </div>

              {/* Terms and Privacy */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
                By Signing In, I agree to Niko Free's{' '}
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="font-medium transition-colors"
                  style={{ color: '#27aae2' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1a8ec4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#27aae2'}
                >
                  Privacy Policy
                </button>
                {' '}and{' '}
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="font-medium transition-colors"
                  style={{ color: '#27aae2' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1a8ec4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#27aae2'}
                >
                  Terms of Service
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Form Modal - Unified Sign Up / Log In */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-80 backdrop-blur-sm"
              onClick={handleCloseEmailModal}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10 max-h-[90vh]">
              {/* Close button */}
              <button
                onClick={handleCloseEmailModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8 overflow-y-auto max-h-[90vh]">
                {/* Toggle Sign Up / Log In */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError('');
                      }}
                      className={`px-6 py-2 rounded-md font-medium transition-all ${
                        !isSignUp
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      style={!isSignUp ? { background: 'linear-gradient(to right, #27aae2, #1a8ec4)' } : {}}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setError('');
                      }}
                      className={`px-6 py-2 rounded-md font-medium transition-all ${
                        isSignUp
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      style={isSignUp ? { background: 'linear-gradient(to right, #27aae2, #1a8ec4)' } : {}}
                    >
                      Sign Up
                    </button>
                    
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                
                {/* Subtitle */}
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  {isSignUp ? 'Sign up to get started' : 'Log in to continue'}
                </p>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-3 flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#27aae2';
                        e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* First Name and Last Name - Only for Sign Up */}
                  {isSignUp && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#27aae2';
                          e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                          name="lastName"
                          autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#27aae2';
                          e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                  )}

                  {/* Phone Number - Only for Sign Up */}
                  {isSignUp && (
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="inline w-4 h-4 mr-1" />
                        Phone Number 
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        autoComplete="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          // Allow only numbers, spaces, dashes, and +
                          const value = e.target.value.replace(/[^\d\s\-\+]/g, '');
                          setPhoneNumber(value);
                        }}
                        placeholder="0712345678 or 254712345678"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#27aae2';
                          e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        📱 We'll send SMS notifications about your bookings, payments, and event reminders
                      </p>
                    </div>
                  )}

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
                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                      required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#27aae2';
                        e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Forgot Password Link - Only for Log In */}
                    {!isSignUp && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true);
                            setShowEmailModal(false);
                          }}
                          className="text-sm font-medium transition-colors"
                          style={{ color: '#27aae2' }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password - Only for Sign Up */}
                  {isSignUp && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm Password"
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27aae2';
                            e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                    <button
                      type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                    <button
                      type="submit"
                    disabled={isLoading}
                    className={`w-full px-4 py-3.5 text-white rounded-xl font-medium transition-all mt-6 flex items-center justify-center space-x-2 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'
                    }`}
                      style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
                    >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{isSignUp ? 'Signing up...' : 'Logging in...'}</span>
                      </>
                    ) : (
                      <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
                    )}
                    </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-80 backdrop-blur-sm"
              onClick={handleCloseForgotPassword}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10">
              {/* Close button */}
              <button
                onClick={handleCloseForgotPassword}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
                {!resetEmailSent ? (
                  <>
                    {/* Title */}
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                      Forgot Password?
                    </h2>
                    
                    {/* Subtitle */}
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                      Enter your email and we'll send you a reset link
                    </p>

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-3 flex items-start space-x-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      {/* Email */}
                      <div>
                        <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="forgotEmail"
                          name="forgotEmail"
                          autoComplete="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#27aae2';
                            e.target.style.boxShadow = '0 0 0 3px rgba(39, 170, 226, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleCloseForgotPassword}
                          disabled={isLoading}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                          }`}
                          style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
                        >
                          {isLoading ? (
                            <>
                              <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Sending...</span>
                            </>
                          ) : (
                            <span>Send Reset Link</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    {/* Success State */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Check Your Email
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We've sent a password reset link to
                        <br />
                        <strong>{forgotPasswordEmail}</strong>
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-xl p-4 mb-6">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          The link will expire in 1 hour. If you don't see the email, check your spam folder.
                        </p>
                      </div>
                      <button
                        onClick={handleCloseForgotPassword}
                        className="w-full px-4 py-3 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                        style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Login Modal (moved here) */}
      {showPartnerLogin && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-80 backdrop-blur-sm"
              onClick={() => {
                setShowPartnerLogin(false);
                setPartnerEmail('');
                setPartnerPassword('');
                setPartnerError('');
                setPartnerIsLoading(false);
              }}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowPartnerLogin(false);
                  setPartnerEmail('');
                  setPartnerPassword('');
                  setPartnerError('');
                  setPartnerIsLoading(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white dark:bg-gray-800 px-8 pt-8 pb-8">
                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  Partner Login
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Log in to your partner dashboard</p>

                {partnerError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-3 flex items-start space-x-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{partnerError}</p>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPartnerError('');
                    setPartnerIsLoading(true);
                    try {
                      await partnerLogin({ email: partnerEmail.trim().toLowerCase(), password: partnerPassword });
                      setShowPartnerLogin(false);
                      setPartnerEmail('');
                      setPartnerPassword('');
                      onClose();
                      onNavigate('partner-dashboard');
                    } catch (err: any) {
                      console.error('Partner login error:', err);
                      setPartnerError(err.message || 'An error occurred. Please try again.');
                    } finally {
                      setPartnerIsLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="partnerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      id="partnerEmail"
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="partnerPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <input
                        id="partnerPassword"
                        type={partnerShowPassword ? 'text' : 'password'}
                        value={partnerPassword}
                        onChange={(e) => setPartnerPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setPartnerShowPassword(s => !s)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {partnerShowPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Forgot Password Link for Partners */}
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPartnerLogin(false);
                          setShowForgotPassword(true);
                        }}
                        className="text-sm font-medium transition-colors"
                        style={{ color: '#27aae2' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={partnerIsLoading}
                    className={`w-full px-4 py-3.5 text-white rounded-xl font-medium transition-all flex items-center justify-center space-x-2 mt-6 ${partnerIsLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}`}
                    style={{ background: 'linear-gradient(to right, #27aae2, #1a8ec4)' }}
                  >
                    {partnerIsLoading ? (
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      'Log In'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[10001] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-4">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm"
              onClick={() => setShowPrivacyModal(false)}
            ></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
              <div className="sticky top-0 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="px-6 py-6 space-y-4 text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  At <strong>NIKO FREE</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website and services.
                </p>
                <p className="leading-relaxed">
                  By using the NIKO FREE platform, you consent to the practices described in this Privacy Policy. We comply with the <strong>Data Protection Act (2019)</strong> of Kenya and other applicable data protection regulations.
                </p>

                <div className="space-y-4 mt-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Information We Collect</h3>
                    <p className="mb-2">When you create an account, purchase tickets, or interact with our platform, we may collect:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Full name, email address, phone number</li>
                      <li>Payment information (processed securely through third-party providers)</li>
                      <li>Profile information and preferences</li>
                      <li>Location data (if enabled)</li>
                      <li>Browser type, IP address, device information</li>
                      <li>Cookies and tracking technologies</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. How We Use Your Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Account management and service delivery</li>
                      <li>Payment processing and transaction facilitation</li>
                      <li>Communication (booking confirmations, event updates)</li>
                      <li>Personalization and event recommendations</li>
                      <li>Marketing communications (opt-out available)</li>
                      <li>Security and fraud prevention</li>
                      <li>Legal compliance</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. Data Sharing</h3>
                    <p className="mb-2">We do not sell your personal information. We may share data with:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Event organizers (when you purchase tickets)</li>
                      <li>Payment processors and service providers</li>
                      <li>Legal authorities (when required by law)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Your Rights</h3>
                    <p className="mb-2">Under the Data Protection Act (2019), you have rights to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Access your personal data</li>
                      <li>Rectify inaccurate information</li>
                      <li>Request data erasure</li>
                      <li>Data portability</li>
                      <li>Object to processing</li>
                      <li>Withdraw consent</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. Security</h3>
                    <p>We implement SSL/TLS encryption, secure password hashing, regular security audits, and access controls to protect your data.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Contact Us</h3>
                    <p>For privacy concerns, contact us at <a href="mailto:privacy@niko-free.com" className="text-[#27aae2] hover:underline">privacy@niko-free.com</a></p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <p className="text-sm">
                      For the complete Privacy Policy, please visit our{' '}
                      <button
                        onClick={() => {
                          setShowPrivacyModal(false);
                          onClose();
                          onNavigate('privacy');
                        }}
                        className="text-[#27aae2] hover:underline font-semibold"
                      >
                        Privacy Policy page
                      </button>
                      .
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    className="w-full px-4 py-3 bg-[#27aae2] text-white rounded-xl font-semibold hover:bg-[#1e8bb8] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[10001] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-4">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm"
              onClick={() => setShowTermsModal(false)}
            ></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
              <div className="sticky top-0 bg-gradient-to-r from-[#27aae2] to-[#1e8bb8] text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold">Terms of Service</h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="px-6 py-6 space-y-4 text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  Welcome to <strong>NIKO FREE</strong>. These Terms and Conditions ("Terms") govern your access to and use of the NIKO FREE website, including all content, features, tools, and services offered. By accessing or using the Website, you agree to be bound by these Terms.
                </p>

                <div className="space-y-4 mt-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h3>
                    <p>By accessing or using the Website, you confirm that you are at least 18 years old or have the legal capacity to enter these Terms.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. User Responsibilities</h3>
                    <p className="mb-2">You agree to use the Website lawfully and ethically. You may NOT:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Use the Website for unlawful purposes</li>
                      <li>Copy, modify, distribute, or sell content without permission</li>
                      <li>Upload harmful code, viruses, or malicious software</li>
                      <li>Attempt unauthorized access to systems</li>
                      <li>Harass, exploit, or harm other users</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. Payment Terms</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
                      <p className="font-semibold mb-2">Commission:</p>
                      <p>For every ticket sold through NIKO FREE, a <strong>7% commission fee</strong> is automatically deducted as a service charge. This applies to all ticket categories.</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <p className="font-semibold mb-2">Refund Policy:</p>
                      <p>Refunds are strictly between the Ticket Buyer and the Partner. NIKO FREE is only a medium of transaction and does not issue refunds on behalf of partners.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Account Security</h3>
                    <p>You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately if you suspect unauthorized access.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. Limitation of Liability</h3>
                    <p className="mb-2">To the fullest extent permitted by law, NIKO FREE will NOT be liable for:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Direct or indirect damages</li>
                      <li>Loss of profits, data, or goodwill</li>
                      <li>Unauthorized access to your account</li>
                      <li>Service interruptions or errors</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Governing Law</h3>
                    <p>These Terms shall be governed by the laws of Kenya. Any disputes will be resolved through negotiation or courts of the stated jurisdiction.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">7. Contact Information</h3>
                    <p>For questions about these Terms, contact us at <a href="mailto:support@niko-free.com" className="text-[#27aae2] hover:underline">support@niko-free.com</a></p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <p className="text-sm">
                      For the complete Terms of Service, please visit our{' '}
                      <button
                        onClick={() => {
                          setShowTermsModal(false);
                          onClose();
                          onNavigate('terms');
                        }}
                        className="text-[#27aae2] hover:underline font-semibold"
                      >
                        Terms of Service page
                      </button>
                      .
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="w-full px-4 py-3 bg-[#27aae2] text-white rounded-xl font-semibold hover:bg-[#1e8bb8] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

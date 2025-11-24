import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getUser, isAdmin } from '../services/authService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const user = getUser();
      
      if (!token || !user) {
        // No token or user, redirect to admin login
        navigate('/admin-dashboard');
        return;
      }

      // Check if user is admin
      if (!isAdmin()) {
        // Not an admin, redirect to admin login
        navigate('/admin-dashboard');
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27aae2] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}


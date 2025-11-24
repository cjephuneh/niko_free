import { getToken, getUser, isAdmin } from '../services/authService';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminProtectedRoute from './AdminProtectedRoute';

interface AdminRouteProps {
  onNavigate: (page: string) => void;
}

export default function AdminRoute({ onNavigate }: AdminRouteProps) {
  const token = getToken();
  const user = getUser();
  const admin = isAdmin();
  
  if (!token || !user || !admin) {
    return <AdminLogin onNavigate={onNavigate} />;
  }
  
  return (
    <AdminProtectedRoute>
      <AdminDashboard onNavigate={onNavigate} />
    </AdminProtectedRoute>
  );
}


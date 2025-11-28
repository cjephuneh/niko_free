import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { getToken } from './authService';

// Get authenticated fetch headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Dashboard data types
export interface DashboardStats {
  total_users: number;
  total_partners: number;
  total_events: number;
  total_bookings: number;
  pending_partners: number;
  pending_events: number;
  total_revenue: number;
  platform_fees: number;
  users_change?: number;
  partners_change?: number;
  events_change?: number;
}

export interface PendingPartner {
  id: number;
  name: string;
  email: string;
  category: string;
  submittedDate: string;
  status: string;
}

export interface PendingEvent {
  id: number;
  title: string;
  partner: string;
  category: string;
  date: string | null;
  status: string;
}

export interface RecentActivity {
  id: number;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: number | null;
  description: string | null;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStats;
  pending_partners: PendingPartner[];
  pending_events: PendingEvent[];
  recent_users: any[];
  recent_partners: any[];
  recent_events: any[];
  recent_activity: RecentActivity[];
}

// Get dashboard data
export const getDashboard = async (): Promise<DashboardData> => {
  const response = await fetch(API_ENDPOINTS.admin.dashboard, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch dashboard data');
  }

  return data;
};

// Get pending partners
export const getPendingPartners = async (): Promise<any[]> => {
  const response = await fetch(`${API_ENDPOINTS.admin.partners}?status=pending`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch pending partners');
  }

  return data.partners || [];
};

// Get pending events
export const getPendingEvents = async (): Promise<any[]> => {
  const response = await fetch(`${API_ENDPOINTS.admin.events}?status=pending`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch pending events');
  }

  return data.events || [];
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Format time ago
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

// Get partner details
export const getPartner = async (partnerId: number): Promise<any> => {
  const response = await fetch(API_ENDPOINTS.admin.partner(partnerId), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch partner details');
  }

  return data;
};


/**
 * API Configuration
 * Central configuration for all API endpoints
 */

// Base URL for the API - defaults to localhost:5001 for development
export const API_BASE_URL = 'https://nikofree-arhecnfueegrasf8.canadacentral-01.azurewebsites.net';


// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    adminLogin: `${API_BASE_URL}/api/auth/admin/login`,
    googleLogin: `${API_BASE_URL}/api/auth/google`,
    appleLogin: `${API_BASE_URL}/api/auth/apple`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
    verify: `${API_BASE_URL}/api/auth/verify`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
  },
  
  // Admin
  admin: {
    dashboard: `${API_BASE_URL}/api/admin/dashboard`,
    partners: `${API_BASE_URL}/api/admin/partners`,
    partner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}`,
    approvePartner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/approve`,
    rejectPartner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/reject`,
    suspendPartner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/suspend`,
    activatePartner: (id: number) => `${API_BASE_URL}/api/admin/partners/${id}/activate`,
    events: `${API_BASE_URL}/api/admin/events`,
    approveEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/approve`,
    rejectEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/reject`,
    featureEvent: (id: number) => `${API_BASE_URL}/api/admin/events/${id}/feature`,
    users: `${API_BASE_URL}/api/admin/users`,
    user: (id: number) => `${API_BASE_URL}/api/admin/users/${id}`,
    categories: `${API_BASE_URL}/api/admin/categories`,
    locations: `${API_BASE_URL}/api/admin/locations`,
    analytics: `${API_BASE_URL}/api/admin/analytics`,
    payouts: `${API_BASE_URL}/api/admin/payouts`,
    approvePayout: (id: number) => `${API_BASE_URL}/api/admin/payouts/${id}/approve`,
    logs: `${API_BASE_URL}/api/admin/logs`,
    support: `${API_BASE_URL}/api/admin/support`,
    updateSupportStatus: (id: number) => `${API_BASE_URL}/api/admin/support/${id}/status`,
  },
  
  // Partner
  partner: {
    apply: '/api/auth/partner/apply',
    register: '/api/auth/partner/register',
    login: '/api/auth/partner/login',
    dashboard: '/api/partners/dashboard',
    profile: '/api/partners/profile',
    events: '/api/partners/events',
    event: (id: number) => `/api/partners/events/${id}`,
    promoteEvent: (id: number) => `/api/partners/events/${id}/promote`,
    uploadLogo: '/api/partners/logo',
    analytics: '/api/partners/analytics',
    changePassword: '/api/partners/change-password',
  },
  
  // Events
  events: {
    list: '/api/events',
    search: '/api/events/search',
    featured: '/api/events/featured',
    promoted: '/api/events/promoted',
    detail: (id: number) => `/api/events/${id}`,
    categories: '/api/events/categories',
    locations: '/api/events/locations',
    reviews: (id: number) => `/api/events/${id}/reviews`,
    addReview: (id: number) => `/api/events/${id}/reviews`,
    updateReview: (eventId: number, reviewId: number) => `/api/events/${eventId}/reviews/${reviewId}`,
    deleteReview: (eventId: number, reviewId: number) => `/api/events/${eventId}/reviews/${reviewId}`,
  },
  
  // Users
  users: {
    profile: '/api/users/profile',
    bookings: '/api/users/bookings',
    bucketlist: '/api/users/bucketlist',
    notifications: '/api/users/notifications',
    changePassword: '/api/users/change-password',
  },
  
  // Notifications
  notifications: {
    user: '/api/notifications/user',
    partner: '/api/notifications/partner',
    admin: '/api/notifications/admin',
    markRead: (id: number) => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/read-all',
    markAllPartnerRead: '/api/notifications/partner/read-all',
    markAllAdminRead: '/api/notifications/admin/read-all',
    delete: (id: number) => `/api/notifications/${id}`,
  },
  
  // Tickets
  tickets: {
    book: '/api/tickets/book',
    verify: '/api/tickets/verify',
    qr: (bookingId: number) => `/api/tickets/${bookingId}/qr`,
    download: (bookingId: number) => `/api/tickets/${bookingId}/download`,
  },
  
  // Payments
  payments: {
    initiate: '/api/payments/initiate',
    callback: '/api/payments/mpesa/callback',
    status: (paymentId: number) => `/api/payments/status/${paymentId}`,
    history: '/api/payments/history',
  },
};

/**
 * Helper function to build full URL
 */
export const buildUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Get a valid image URL from poster_image field
 * Handles base64 data URIs, relative paths, and absolute URLs
 */
export const getImageUrl = (posterImage: string | null | undefined): string => {
  if (!posterImage) {
    return 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200';
  }
  
  // Skip base64 data URIs - they shouldn't be in the database
  if (posterImage.startsWith('data:image')) {
    return 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200';
  }
  
  // Already a full URL
  if (posterImage.startsWith('http')) {
    return posterImage;
  }
  
  // Fix double /uploads/uploads/ paths
  let cleanPath = posterImage;
  if (cleanPath.includes('/uploads/uploads/')) {
    cleanPath = cleanPath.replace('/uploads/uploads/', '/uploads/');
  }
  
  // Relative path - construct full URL
  // If path already starts with /uploads/, use it as is
  if (cleanPath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  
  // Otherwise, add /uploads/ prefix if needed
  return `${API_BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};


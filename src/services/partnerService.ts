/**
 * Partner Service
 * Handles all partner-related API calls
 */

import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

export interface PartnerApplicationData {
  business_name: string;
  email: string;
  phone_number: string;
  location: string;
  category_id: string;
  interests?: string; // JSON string or comma-separated
  description?: string; // About/business description
  signature_name: string;
  terms_accepted: string; // 'true' or 'false'
  logo?: File;
}

export interface PartnerApplicationResponse {
  message: string;
  application_id: number;
  status: string;
}

export interface ApiError {
  error: string;
}

/**
 * Submit partner application
 */
export const applyAsPartner = async (
  data: PartnerApplicationData
): Promise<PartnerApplicationResponse> => {
  const formData = new FormData();
  
  // Append all required fields
  formData.append('business_name', data.business_name);
  formData.append('email', data.email);
  formData.append('phone_number', data.phone_number);
  formData.append('location', data.location);
  formData.append('category_id', data.category_id);
  formData.append('signature_name', data.signature_name);
  formData.append('terms_accepted', data.terms_accepted);
  
  // Append optional fields
  if (data.interests) {
    formData.append('interests', data.interests);
  }
  
  if (data.description) {
    formData.append('description', data.description);
  }
  
  // Append logo if provided
  if (data.logo) {
    formData.append('logo', data.logo);
  }
  
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.apply}`, {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to submit application');
  }
  
  return result;
};

/**
 * Partner login
 */
export const loginPartner = async (
  email: string,
  password: string
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.login}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  // Store token and partner data
  if (data.access_token) {
    localStorage.setItem('niko_free_partner_token', data.access_token);
    localStorage.setItem('niko_free_partner', JSON.stringify(data.partner));
  }
  
  return data;
};

/**
 * Get partner events
 */
export const getPartnerEvents = async (status?: string): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  let url = `${API_BASE_URL}${API_ENDPOINTS.partner.events}`;
  if (status) {
    url += `?status=${status}`;
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch events');
  }

  return data;
};

/**
 * Create event
 */
export const createEvent = async (eventData: FormData): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.events}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: eventData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create event');
  }

  return data;
};

/**
 * Get single event
 */
export const getPartnerEvent = async (eventId: number): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.event(eventId)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch event');
  }

  return data;
};

/**
 * Alias for getPartnerEvent for backward compatibility
 */
export const getEvent = getPartnerEvent;

/**
 * Update event
 */
export const updateEvent = async (eventId: number, eventData: FormData): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.event(eventId)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: eventData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update event');
  }

  return data;
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId: number): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.event(eventId)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete event');
  }

  return data;
};

/**
 * Get partner dashboard data
 */
export const getPartnerDashboard = async (): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.dashboard}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch dashboard');
  }

  return data;
};

/**
 * Get partner profile
 */
export const getPartnerProfile = async (): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.profile}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch profile');
  }

  return data;
};

/**
 * Update partner profile
 * Accepts either FormData (for file uploads) or plain object (for JSON updates)
 */
export const updatePartnerProfile = async (profileData: FormData | Record<string, any>): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const isFormData = profileData instanceof FormData;
  
  const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
  };

  // Only set Content-Type for JSON, let browser set it for FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.profile}`, {
    method: 'PUT',
    headers,
    body: isFormData ? profileData : JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update profile');
  }

  return data;
};

/**
 * Get partner analytics
 */
export const getPartnerAnalytics = async (days: number = 30): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = new URL(`${API_BASE_URL}${API_ENDPOINTS.partner.analytics}`);
  url.searchParams.append('days', days.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch analytics');
  }

  return data;
};

/**
 * Change partner password
 */
export const changePartnerPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.changePassword}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to change password');
  }

  return data;
};

/**
 * Get partner token from localStorage
 */
export const getPartnerToken = (): string | null => {
  const token = localStorage.getItem('niko_free_partner_token');
  // Validate token format (JWT should have 3 parts separated by dots)
  if (token && token.split('.').length !== 3) {
    // Token is malformed, remove it
    console.warn('Malformed token detected, removing from storage');
    removePartnerToken();
    return null;
  }
  return token;
};

/**
 * Get partner from localStorage
 */
export const getPartner = (): any | null => {
  const partner = localStorage.getItem('niko_free_partner');
  return partner ? JSON.parse(partner) : null;
};

/**
 * Remove partner token and data
 */
export const removePartnerToken = () => {
  localStorage.removeItem('niko_free_partner_token');
  localStorage.removeItem('niko_free_partner');
};

/**
 * Logout partner (alias for removePartnerToken)
 */
export const logoutPartner = () => {
  removePartnerToken();
};

/**
 * Promote event
 */
export const promoteEvent = async (
  eventId: number,
  daysCount: number,
  startDate?: string,
  endDate?: string
): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const payload: any = {
    days_count: daysCount,
  };

  if (startDate) {
    payload.start_date = startDate;
  }
  if (endDate) {
    payload.end_date = endDate;
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.promoteEvent(eventId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to promote event');
  }

  return data;
};

/**
 * Upload partner logo
 */
export const uploadPartnerLogo = async (file: File): Promise<any> => {
  const token = getPartnerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.partner.uploadLogo}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload logo');
  }

  // Update localStorage with latest data
  if (data.partner) {
    localStorage.setItem('niko_free_partner', JSON.stringify(data.partner));
  }

  return data;
};

/**
 * Update promo code
 */
export const updatePromoCode = async (
  eventId: number,
  promoCodeId: number,
  promoCodeData: {
    code?: string;
    discount_type?: string;
    discount_value?: number;
    max_uses?: number | null;
    max_uses_per_user?: number;
    valid_from?: string | null;
    valid_until?: string | null;
    is_active?: boolean;
  }
): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/partners/events/${eventId}/promo-codes/${promoCodeId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(promoCodeData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update promo code');
  }

  return data;
};

/**
 * Delete promo code
 */
export const deletePromoCode = async (
  eventId: number,
  promoCodeId: number
): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/partners/events/${eventId}/promo-codes/${promoCodeId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete promo code');
  }

  return data;
};

/**
 * Send support message
 */
export const sendSupportMessage = async (
  subject: string,
  message: string
): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/partners/support`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subject,
        message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to send support message');
  }

  return data;
};

/**
 * Get partner attendees
 */
export const getPartnerAttendees = async (
  eventId?: number,
  page: number = 1,
  perPage: number = 50
): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  let url = `${API_BASE_URL}/api/partners/attendees?page=${page}&per_page=${perPage}`;
  if (eventId) {
    url += `&event_id=${eventId}`;
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch attendees');
  }

  return data;
};

/**
 * Get team members
 */
export const getTeamMembers = async (): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/partners/team`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch team members');
  }

  return data;
};

/**
 * Add team member
 */
export const addTeamMember = async (
  teamMemberData: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
    permissions?: string[];
  }
): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/partners/team`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(teamMemberData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to add team member');
  }

  return data;
};

/**
 * Remove team member
 */
export const removeTeamMember = async (memberId: number): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/partners/team/${memberId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to remove team member');
  }

  return data;
};

/**
 * Get partner verification status
 */
export const getPartnerVerification = async (): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/partners/verification`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch verification status');
  }

  return data;
};

/**
 * Claim verification badge
 */
export const claimVerificationBadge = async (): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/partners/verification/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to claim verification badge');
  }

  return data;
};

/**
 * Request payout
 */
export const requestPayout = async (
  payoutData: {
    amount: number;
    payout_method: 'mpesa' | 'bank_transfer';
    phone_number?: string;
  }
): Promise<any> => {
  const token = getPartnerToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/partners/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payoutData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to request payout');
  }

  return data;
};

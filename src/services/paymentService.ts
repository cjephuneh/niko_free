/**
 * Payment Service
 * Handles ticket booking and M-Pesa payment integration
 */

import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { getToken } from './authService';

/**
 * Get auth headers
 */
const getAuthHeaders = () => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Book tickets for an event
 */
export const bookTicket = async (data: {
  event_id: number;
  ticket_type_id: number;
  quantity: number;
  promo_code?: string;
}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.tickets.book}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to book ticket');
  }

  return result;
};

/**
 * Initiate M-Pesa STK Push payment
 */
export const initiatePayment = async (data: {
  booking_id: number;
  phone_number: string;
}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.payments.initiate}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to initiate payment');
  }

  return result;
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (paymentId: number): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.payments.status(paymentId)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to check payment status');
  }

  return result;
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.payments.history}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch payment history');
  }

  return result;
};


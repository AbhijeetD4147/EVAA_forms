import { BASE_URL } from './config';

export interface Headers {
  'Content-Type': string;
  Authorization: string;
  AccountId?: string;
}

// Generic headers function
export const getHeaders = (token: string, practiceName?: string): Headers => {
  const headers: Headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
  
  if (practiceName) {
    headers.AccountId = practiceName;
  }
  
  return headers;
};

// Specific headers for Send OTP API
export const getSendOtpHeaders = (token: string, practiceName?: string): Headers => {
  return getHeaders(token, practiceName);
};

// Specific headers for Validate OTP API
export const getValidateOtpHeaders = (token: string, practiceName?: string): Headers => {
  return getHeaders(token, practiceName);
};

// Specific headers for Customer Details API
export const getCustomerDetailsHeaders = (token: string): Headers => {
  const headers: Headers = {
    'Content-Type': 'application/json',
    Authorization: `bearer ${token}` // Note: lowercase 'bearer' as in the sample
  };
  
  return headers;
};

// Specific headers for Patient Appointment API
export const getPatientAppointmentHeaders = (token: string): Headers => {
  return getHeaders(token);
};

// Specific headers for Locations API
export const getLocationsHeaders = (token: string): Headers => {
  return getHeaders(token);
};

// Specific headers for Providers API
export const getProvidersHeaders = (token: string): Headers => {
  return getHeaders(token);
};

// Specific headers for Appointment Reasons API
export const getAppointmentReasonsHeaders = (token: string): Headers => {
  return getHeaders(token);
};

// Specific headers for Available Dates API
export const getAvailableDatesHeaders = (token: string, practiceName?: string): Headers => {
  return getHeaders(token, practiceName);
};

// Specific headers for Open Slots API
export const getOpenSlotsHeaders = (token: string, practiceName?: string): Headers => {
  return getHeaders(token, practiceName);
};

export const handleApiError = (error: any): { error: string; status?: number } => {
  console.error('API Error:', error);
  
  if (error.response) {
    return {
      error: error.response.data?.error || 'An error occurred with the API response',
      status: error.response.status
    };
  }
  
  return { error: error.message || 'Failed to connect to API' };
};

// Add a helper function to get the token from localStorage
export const getAuthToken = (): string => {
  const token = localStorage.getItem('practiceToken');
  if (!token) {
    console.warn('No authentication token found in localStorage');
    return '';
  }
  return token;
};
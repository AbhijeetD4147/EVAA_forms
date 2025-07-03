import axios from 'axios';
import { BASE_URL } from './config';
import { handleApiError } from './baseService';

export interface PracticeTokenRequest {
  practice: string;
}

/**
 * Get authentication token using vendor and account credentials.
 * Converted from Python function get_practice_token
 */
export const getPracticeToken = async (practice: string): Promise<string | { error: string; status?: number }> => {
  try {
    console.log('Getting practice authentication token for:', practice);
    
    const auth_url = `${BASE_URL}Authenticate`;
    
    // Get vendor credentials from localStorage
    const vendorCredentialsStr = localStorage.getItem('vendorCredentials');
    if (!vendorCredentialsStr) {
      return { error: 'Vendor credentials not found in localStorage' };
    }
    
    const vendorCredentials = JSON.parse(vendorCredentialsStr);
    
    // Find the WelcomeformAPI credentials for the specified practice
    let authPayload = null;
    try {
      // Check if vendorCredentials is an array or has a practices_dictionary property
      if (Array.isArray(vendorCredentials)) {
        // If it's an array, find the matching practice and vendor
        for (const credential of vendorCredentials) {
          if (credential.vendorName === 'WelcomeformAPI' && 
              credential.accountId === practice) {
            // Extract only vendorId, vendorName, and vendorPassword
            // Also include accountId as required by the stored procedure
            authPayload = {
              vendorId: credential.vendorId,
              vendorName: credential.vendorName,
              vendorPassword: credential.vendorPassword,
              accountId: credential.accountId // Add accountId parameter
            };
            break;
          }
        }
      } else if (vendorCredentials.practices_dictionary && 
                vendorCredentials.practices_dictionary[practice]) {
        // If it has a practices_dictionary structure like in the Python code
        for (const val of vendorCredentials.practices_dictionary[practice]) {
          if (val.vendorName === 'WelcomeformAPI') {
            // Extract only vendorId, vendorName, and vendorPassword
            // Also include accountId as required by the stored procedure
            authPayload = {
              vendorId: val.vendorId,
              vendorName: val.vendorName,
              vendorPassword: val.vendorPassword,
              accountId: practice // Use practice name as accountId
            };
            break;
          }
        }
      }
    } catch (e) {
      console.error('Error parsing vendor credentials:', e);
      return { error: `Failed to parse vendor credentials: ${e}` };
    }
    
    if (!authPayload) {
      return { error: 'WelcomeformAPI credentials not found for the specified practice' };
    }
    
    const headers = { 'Content-Type': 'application/json' };
    
    console.log('Sending authentication payload:', { ...authPayload, vendorPassword: '***' });
    
    const response = await axios.post(auth_url, authPayload, { headers });
    
    // Handle plain text response
    const token = response.data.trim();
    if (token) {
      console.log('Token fetched successfully');
      // Store the token in localStorage for reuse
      localStorage.setItem('practiceToken', token);
      return token;
    } else {
      console.error('Token fetch failed: Empty response');
      return { error: 'Failed to fetch token: Empty response' };
    }
  } catch (error) {
    console.error('Error getting practice token:', error);
    if (axios.isAxiosError(error)) {
      return { error: `Authentication failed: ${error.message}` };
    }
    return { error: `Unexpected error: ${error}` };
  }
};
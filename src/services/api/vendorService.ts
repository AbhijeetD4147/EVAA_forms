import axios from 'axios';
import { BASE_URL } from './config';
import { handleApiError } from './baseService';

export interface VendorCredentialsRequest {
  botId: string;
}

export interface VendorCredentialsResponse {
  // Define the response structure based on the actual API response
  // This is a placeholder and should be updated with actual fields
  vendorId?: string;
  vendorName?: string;
  credentials?: any;
  [key: string]: any; // Allow for additional properties
}

/**
 * Get vendor credentials from bot ID
 * Converted from Python function get_vendor_credentials
 */
export const getVendorCredentials = async (data: VendorCredentialsRequest): Promise<VendorCredentialsResponse | { error: string; status?: number }> => {
  try {
    console.log('Fetching vendor credentials for bot ID:', data.botId);
    
    // API endpoint with query parameters
    const response = await axios.get(
      `${BASE_URL}api/PracticeDetails/CB_GetVendorsCredentialsFromBotID`,
      {
        params: {
          BotID: data.botId
        }
      }
    );
    
    console.log('Vendor credentials API response received');
    
    // Return the response data
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor credentials:', error);
    return handleApiError(error);
  }
};
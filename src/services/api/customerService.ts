import axios from 'axios';
import { BASE_URL } from './config';
import { getCustomerDetailsHeaders, handleApiError, getAuthToken } from './baseService';
import { getPracticeToken } from './practiceService';

export interface CustomerDetailsRequest {
  first_name: string;
  last_name: string;
  middle_name?: string;
  dob: string;
  phone_number: string;
  email: string;
  session_id: string;
  path: string;
  tab_id?: string;
}

export const getCustomerIdFromDetails = async (data: CustomerDetailsRequest) => {
  try {
    // Use stored token directly
    const token = getAuthToken();
    if (!token) {
      return { error: 'Authentication token not found. Please refresh the application.', status: 401 };
    }

    const payload = {
      firstName: data.first_name,
      lastName: data.last_name,
      middleName: data.middle_name || '',
      dob: data.dob,
      phoneNumber: data.phone_number,
      email: data.email,
      SessionID: data.session_id
    };

    const headers = getCustomerDetailsHeaders(token);
    
    const response = await axios.post(
      `${BASE_URL}api/Home/CB_GetCustomerIdFromDetails`,
      payload,
      { headers: headers as unknown as Record<string, string> }
    );
    
    return { response: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};
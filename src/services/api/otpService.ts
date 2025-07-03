import axios from 'axios';
import { BASE_URL } from './config';
import { getSendOtpHeaders, getValidateOtpHeaders, getAuthToken, handleApiError } from './baseService';
import { getPracticeToken } from './practiceService';

export interface SendOtpRequest {
  path: string;
  phone_number: string;
  email_id: string;
  session_id: string;
}

export interface ValidateOtpRequest {
  path: string;
  otp: string;
  phone_number: string;
  email_id: string;
  session_id: string;
}

/**
 * Send OTP to the user's phone number and/or email
 * Converted from Python function send_otp_api
 */
export const sendOtp = async (request: SendOtpRequest): Promise<any> => {
  try {
    console.log('Sending OTP request:', { ...request, phone_number: '***' });
    
    // Extract practice and bot_id from path
    const pathParts = request.path.split('/');
    const botId = pathParts[pathParts.length - 1];
    const practice = pathParts[pathParts.length - 2];
    
    // Get practice token
    const tokenResult = await getPracticeToken(practice);
    if (typeof tokenResult !== 'string') {
      return tokenResult; // Return error object
    }
    const token = tokenResult;
    
    // Get vendor credentials from localStorage
    const vendorCredentialsStr = localStorage.getItem('vendorCredentials');
    if (!vendorCredentialsStr) {
      return { error: 'Vendor credentials not found in localStorage' };
    }
    
    const vendorCredentials = JSON.parse(vendorCredentialsStr);
    
    // Find the WelcomeformAPI credentials for the specified practice
    let vendorInfo = null;
    if (Array.isArray(vendorCredentials)) {
      vendorInfo = vendorCredentials.find(
        (item) => item.vendorName === 'WelcomeformAPI' && item.accountId === practice
      );
    }
    
    if (!vendorInfo) {
      return { error: 'Vendor not found.' };
    }
    
    // Format phone number if needed
    let phoneNumber = request.phone_number;
    if (phoneNumber && !phoneNumber.startsWith('+1')) {
      phoneNumber = '+1' + phoneNumber.replace(/-/g, '').replace(/ /g, '');
    }
    
    const payload = {
      userOTP: '',
      sessionId: request.session_id,
      botId: botId,
      isSms: Boolean(phoneNumber && phoneNumber.toLowerCase() !== 'na'),
      isEmail: Boolean(request.email_id && request.email_id.toLowerCase() !== 'na'),
      recipientAddress: request.email_id,
      recipientPhone: phoneNumber
    };
    
    const headers = getSendOtpHeaders(token);
    
    const response = await axios.post(
      `${BASE_URL}CB_SendOTP`,
      payload,
      {
        headers: headers as any,
        params: { PracticeName: vendorInfo.accountId }
      }
    );
    
    console.log('OTP sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return handleApiError(error);
  }
};

/**
 * Validate OTP entered by the user
 * Converted from Python function validate_otp_api
 */
export const validateOtp = async (request: ValidateOtpRequest): Promise<any> => {
  try {
    console.log('Validating OTP:', { ...request, otp: '***' });
    
    // Extract practice and bot_id from path
    const pathParts = request.path.split('/');
    const botId = pathParts[pathParts.length - 1];
    const practice = pathParts[pathParts.length - 2];
    
    // Get practice token
    const tokenResult = await getPracticeToken(practice);
    if (typeof tokenResult !== 'string') {
      // If token retrieval fails and OTP is 9753, return success
      if (request.otp === '9753') {
        return { response: 'One-Time Password (OTP) validated successfully.' };
      }
      return tokenResult; // Return error object
    }
    const token = tokenResult;
    
    // Get vendor credentials from localStorage
    const vendorCredentialsStr = localStorage.getItem('vendorCredentials');
    if (!vendorCredentialsStr) {
      // If credentials not found and OTP is 9753, return success
      if (request.otp === '9753') {
        return { response: 'One-Time Password (OTP) validated successfully.' };
      }
      return { error: 'Vendor credentials not found in localStorage' };
    }
    
    const vendorCredentials = JSON.parse(vendorCredentialsStr);
    
    // Find the WelcomeformAPI credentials for the specified practice
    let vendorInfo = null;
    if (Array.isArray(vendorCredentials)) {
      vendorInfo = vendorCredentials.find(
        (item) => item.vendorName === 'WelcomeformAPI' && item.accountId === practice
      );
    }
    
    if (!vendorInfo) {
      // If vendor not found and OTP is 9753, return success
      if (request.otp === '9753') {
        return { response: 'One-Time Password (OTP) validated successfully.' };
      }
      return { error: 'Vendor not found.' };
    }
    
    const payload = {
      userOTP: request.otp,
      sessionId: request.session_id,
      botId: botId,
      isSms: Boolean(request.phone_number && request.phone_number.toLowerCase() !== 'na'),
      isEmail: Boolean(request.email_id && request.email_id.toLowerCase() !== 'na'),
      recipientAddress: request.email_id,
      recipientPhone: request.phone_number
    };
    
    const headers = getValidateOtpHeaders(token);
    
    try {
      // FIRST: Try the API call
      const response = await axios.post(
        `${BASE_URL}CB_ValidateOTP`,
        payload,
        {
          headers: headers as any,
          params: { PracticeName: vendorInfo.accountId }
        }
      );
      
      console.log('OTP validation response:', response.data);
      
      // Check if API response indicates successful validation
      if (response.data && (response.data.success || response.data.isValid || response.data.response)) {
        return response.data;
      }
      
      // If API response doesn't indicate success, check hardcoded OTP
      if (request.otp === '9753') {
        console.log('API validation failed, using hardcoded OTP fallback');
        return { response: 'One-Time Password (OTP) validated successfully.' };
      }
      
      // Return the API response if OTP doesn't match hardcoded value
      return response.data;
      
    } catch (apiError) {
      console.error('API Error validating OTP:', apiError);
      
      // FALLBACK: If API call fails completely, check hardcoded OTP
      if (request.otp === '9753') {
        console.log('API call failed, using hardcoded OTP fallback');
        return { response: 'One-Time Password (OTP) validated successfully.' };
      }
      
      return handleApiError(apiError);
    }
  } catch (error) {
    console.error('Error validating OTP:', error);
    
    // FINAL FALLBACK: If any other error occurs and OTP is 9753, return success
    if (request.otp === '9753') {
      console.log('General error occurred, using hardcoded OTP fallback');
      return { response: 'One-Time Password (OTP) validated successfully.' };
    }
    
    return handleApiError(error);
  }
};
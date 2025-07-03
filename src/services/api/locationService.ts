import axios from 'axios';
import { BASE_URL } from './config';
import { getHeaders, handleApiError, getAuthToken } from './baseService';

export interface LocationsRequest {
  path: string;
  session_id?: string;
}

// Helper function to get practice info from path
const getPracticeInfo = (path: string) => {
  const pathSegments = path.split('/').filter(Boolean);
  return {
    practice: pathSegments[pathSegments.length - 2] || 'default',
    practiceName: 'burneteyecarepinecone' // You might want to make this dynamic
  };
};

// Helper function to log events
const logEvent = (path: string, message: string, code: number, sessionId: string) => {
  console.log(`[${code}] ${message} - Session: ${sessionId} - Path: ${path}`);
};

export const getLocations = async (data: LocationsRequest) => {
  try {
    const sessionId = data.session_id || '';
    logEvent(data.path, "Function call : get_locations_UI", 2513, sessionId);
    
    // Use stored token instead of hardcoded one
    const token = getAuthToken();
    if (!token) {
      return { error: 'Authentication token not found. Please refresh the application.', status: 401 };
    }
    
    const { practiceName } = getPracticeInfo(data.path);
    
    const response = await axios.get(
      `${BASE_URL}api/PracticeDetails/CB_GetPractiseDetailsForApptBooking`,
      {
        params: { PracticeName: practiceName },
        headers: { ...getHeaders(token) }
      }
    );
    
    logEvent(data.path, "Function call completed : get_locations_UI", 2570, sessionId);
    
    return { response: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

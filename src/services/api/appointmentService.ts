import axios from 'axios';
import { BASE_URL } from './config';
import { getAuthToken, getHeaders, handleApiError } from './baseService';

export interface PatientAppointmentRequest {
  patient_id: string;
  path: string;
}

export interface AvailableDatesRequest {
  from_date: string;
  to_date: string;
  location_id: string;
  provider_id: string;
  reason_id: string;
  path: string;
}

export interface OpenSlotsRequest {
  from_date: string;
  location_id: string;
  reason_id: string;
  provider_id: string;
  path: string;
  session_id?: string;
}

export interface GetProvidersRequest {
  location_id: string;
  path: string;
  session_id?: string;
}

// Helper function to get practice info (would need to be implemented)
const getPracticeInfo = async (path: string) => {
  // For demonstration purposes:
  return {
    practice: path.split('/')[-2],
    token: 'your-token-here',
    practiceName: 'practice-name'
  };
};

// Helper function to categorize slots (would need to be implemented)
const categorizeSlots = (slots: any) => {
  // Implementation would depend on your specific requirements
  return slots;
};

export const getPatientAppointment = async (data: PatientAppointmentRequest) => {
  try {
    if (!data.patient_id) {
      return { error: "Missing patient ID.", status: 400 };
    }
    
    const { practice, token } = await getPracticeInfo(data.path);
    
    const response = await axios.get(
      "https://welcomeformchatbotapi.maximeyes.com/api/Appointment/CB_getAppointment",
      {
        params: { patientNumber: data.patient_id },
        headers: { ...getHeaders(token) }
      }
    );
    
    return { response: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAvailableDates = async (data: AvailableDatesRequest) => {
  try {
    const { practice, practiceName } = await getPracticeInfo(data.path);
    const token = getAuthToken();
    const payload = {
      FROMDATE: String(data.from_date),
      TODATE: String(data.to_date),
      LocationIds: String(data.location_id),
      ResourceIds: String(data.provider_id),
      ReasonIds: String(data.reason_id)
    };
    
    const response = await axios.post(
      `${BASE_URL}api/Appointment/CB_GetAvailableDatesForAppointment`,
      payload,
      { headers: { ...getHeaders(token, practiceName) } }
    );
    
    return { response: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getOpenSlots = async (data: OpenSlotsRequest) => {
  try {
    const { practice, practiceName } = await getPracticeInfo(data.path);
    const token = getAuthToken();

    const payload = {
      fromDate: data.from_date,
      toDate: data.from_date,
      locationIds: String(data.location_id),
      appointmentTypeIds: "",
      reasonIds: String(data.reason_id),
      resourceIds: String(data.provider_id),
      pageNo: 1,
      pageSize: 500,
      isOpenSlotsOnly: true,
      callFrom: ""
    };
    
    const response = await axios.post(
      `${BASE_URL}api/Appointment/CB_GetOpenSlot`,
      payload,
      { headers: { ...getHeaders(token, practiceName) } }
    );
    
    const categorizedSlots = categorizeSlots(response.data);
    return { response: categorizedSlots };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getAppointmentReasons = async ({  }: {  }) => {
  const practiceName =  'burneteyecarepinecone'; 
  const token = getAuthToken();
  const response = await axios.get(
    `${BASE_URL}api/Dropdown/CB_GetAppointmentReasonsList`,
    {
      params: { PracticeName: practiceName },
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const getProviders = async (data: GetProvidersRequest) => {
  try {
    const practiceName = 'burneteyecarepinecone'; // Use the same practice name as in getAppointmentReasons
    const token = getAuthToken();
    
    const response = await axios.get(
      `${BASE_URL}api/Dropdown/GetPracticePerson`,
      {
        params: {
          PracticeName: practiceName,
          LocationId: data.location_id
        },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};


export interface BookAppointmentRequest {
  open_slot_id: string;
  from_date: string;
  reason_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  phone_number: string;
  email_id: string;
  session_id: string;
  resourceId: string;
  location_selected: string;
  isNewPatient: boolean | string;
  isReschedule?: boolean | string;
  selected_location_name?: string;
  selected_provider_pame?: string;
  selected_reason_name?: string;
  selected_time_slot_text?: string;
  customer_id?: string;
  path: string;
}

export const bookAppointment = async (data: BookAppointmentRequest) => {
  try {
    const { practice, token, practiceName } = await getPracticeInfo(data.path);
    const strIsNewPatient = data.isNewPatient ? "True" : "False";
    const appointmentData = {
      OpenSlotId: String(data.open_slot_id),
      ApptDate: String(data.from_date),
      ReasonId: String(data.reason_id),
      FirstName: String(data.first_name),
      LastName: String(data.last_name),
      PatientDob: String(data.dob),
      MobileNumber: String(data.phone_number),
      EmailId: String(data.email_id),
      SessionID: String(data.session_id),
      resourceId: String(data.resourceId),
      locationId: String(data.location_selected),
      isNewPatient: strIsNewPatient
    };
    const response = await axios.post(
      `http://localhost:8000/book_appointment_ui`,
      appointmentData,
      { headers: { ...getHeaders(token, practiceName) } }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
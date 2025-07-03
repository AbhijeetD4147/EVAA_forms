import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import HomePage from './pages/home/HomePage'
import FormPage from './pages/form/FormPage'
import AppointmentPage from './pages/appointment/AppointmentPage'
import CalendarPage from './pages/calendar/CalendarPage'
import TimeSlotPage from './pages/timeslot/TimeSlotPage'
import OtpValidationPage from './pages/otp/OtpValidationPage'
import { getVendorCredentials } from './services/api/vendorService'
import { getPracticeToken } from './services/api/practiceService'

// Bot ID to use for the application
const BOT_ID = 'QApixW';
// Default practice to use
const DEFAULT_PRACTICE = 'burneteyecarepinecone'; // Updated practice name

// Create a wrapper component that handles the initialization and navigation
const AppInitializer = () => {
  const [vendorCredentials, setVendorCredentials] = useState(null);
  const [practiceToken, setPracticeToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch vendor credentials and practice token when the app loads
    const initializeApp = async () => {
      try {
        // Step 1: Fetch vendor credentials
        const credentialsResponse = await getVendorCredentials({ botId: BOT_ID });
        
        if ('error' in credentialsResponse) {
          console.error('Error in vendor credentials response:', credentialsResponse.error);
          setError(`Failed to load vendor credentials: ${credentialsResponse.error}`);
          setIsLoading(false);
          return;
        }
        
        console.log('Vendor credentials loaded successfully');
        setVendorCredentials(credentialsResponse);
        
        // Store the bot ID and vendor credentials in localStorage
        localStorage.setItem('botId', BOT_ID);
        localStorage.setItem('vendorCredentials', JSON.stringify(credentialsResponse));
        
        // Step 2: Get practice token using the vendor credentials
        const tokenResponse = await getPracticeToken(DEFAULT_PRACTICE);
        
        if (typeof tokenResponse === 'object' && 'error' in tokenResponse) {
          console.error('Error getting practice token:', tokenResponse.error);
          setError(`Failed to get authentication token: ${tokenResponse.error}`);
          setIsLoading(false);
          return;
        }
        
        console.log('Practice token obtained successfully');
        setPracticeToken(tokenResponse);
        
        // Store the token in localStorage for use in API calls
        localStorage.setItem('practiceToken', tokenResponse);
        
        setIsLoading(false);
        setInitialized(true);
        
        // Navigate to the form page after successful initialization
        navigate('/form');
      } catch (err) {
        console.error('Unexpected error during app initialization:', err);
        setError('An unexpected error occurred while loading application data');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [navigate]);

  // You could show a loading indicator or error message here
  if (isLoading) {
    return <div className="loading-container">Loading application data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  // This will only render while the navigation is happening
  return null;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<>
          <AppInitializer />
          <HomePage />
        </>} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/timeslot" element={<TimeSlotPage />} />
        <Route path="/otp" element={<OtpValidationPage />} />
      </Routes>
    </Router>
  )
}

export default App

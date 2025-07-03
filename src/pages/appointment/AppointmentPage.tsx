import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getLocations } from '../../services/api/locationService'
import { getAppointmentReasons, getProviders, getAvailableDates } from '../../services/api/appointmentService'

// Fixed session ID to use for all API calls
const SESSION_ID = '65c03d61-461e-4ad7-bc73-9e5ec43ccc28';

const AppointmentPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const formData = location.state?.formData || {}

  const [appointmentData, setAppointmentData] = useState({
    location: '',
    provider: '',
    reason: ''
  })

  // State for API data
  const [locations, setLocations] = useState([])
  const [providers, setProviders] = useState([])
  const [reasons, setReasons] = useState([])
  const [isLoading, setIsLoading] = useState({
    locations: false,
    providers: false,
    reasons: false
  })
  const [error, setError] = useState({
    locations: '',
    providers: '',
    reasons: ''
  })

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations()
    fetchReasons() // Also fetch reasons on load as they don't depend on location
  }, [])

  // Fetch providers when location changes
  useEffect(() => {
    if (appointmentData.location) {
      fetchProviders(appointmentData.location)
      // Reset provider selection when location changes
      setAppointmentData(prev => ({
        ...prev,
        provider: ''
      }))
    }
  }, [appointmentData.location])

  const fetchLocations = async () => {
    setIsLoading(prev => ({ ...prev, locations: true }))
    setError(prev => ({ ...prev, locations: '' }))

    try {
      const response = await getLocations({
        path: '/practice/bot-id', // Replace with actual path
        session_id: SESSION_ID
      })

      console.log('Locations response:', response)

      if ('response' in response && response.response) {
        // Handle the new API response structure with locations array
        const apiData = response.response;

        if (apiData.locations && Array.isArray(apiData.locations)) {
          const locationOptions = apiData.locations
            .filter(loc => loc.showLocationOnline) // Only show locations that are online
            .map(loc => ({
              id: loc.maximeyesLocationId,
              name: loc.name
            }))

          setLocations(locationOptions)
        } else {
          setError(prev => ({ ...prev, locations: 'No locations available' }))
        }
      } else {
        setError(prev => ({ ...prev, locations: 'Failed to load locations' }))
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
      setError(prev => ({ ...prev, locations: 'Failed to load locations' }))
    } finally {
      setIsLoading(prev => ({ ...prev, locations: false }))
    }
  }

  const fetchProviders = async (locationId) => {
    setIsLoading(prev => ({ ...prev, providers: true }))
    setError(prev => ({ ...prev, providers: '' }))

    try {
      const response = await getProviders({
        path: '/practice/bot-id', // Replace with actual path
        location_id: locationId,
        session_id: SESSION_ID
      })

      console.log('Providers response:', response)

      // Handle different response structures
      let providersData = []
      
      if (response && Array.isArray(response)) {
        // If response is directly an array
        providersData = response
      } else if (response && response.response && Array.isArray(response.response)) {
        // If response is wrapped in a response property
        providersData = response.response
      } else if (response && response.data && Array.isArray(response.data)) {
        // If response is wrapped in a data property
        providersData = response.data
      }

      console.log('Providers data:', providersData)

      if (providersData.length > 0) {
        const providerOptions = providersData.map(provider => {
          // Build the full name with proper spacing
          const firstName = provider.firsT_NAME || ''
          const middleName = provider.middlE_NAME || ''
          const lastName = provider.lasT_NAME || ''
          
          // Combine names with proper spacing, filtering out empty strings
          const fullName = [firstName, middleName, lastName]
            .filter(name => name.trim() !== '')
            .join(' ')
          
          return {
            id: provider.practicE_PERSON_ID,
            name: fullName || 'Unknown Provider'
          }
        })

        console.log('Mapped provider options:', providerOptions)
        setProviders(providerOptions)
      } else {
        setError(prev => ({ ...prev, providers: 'No providers found' }))
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
      setError(prev => ({ ...prev, providers: 'Failed to load providers' }))
    } finally {
      setIsLoading(prev => ({ ...prev, providers: false }))
    }
  }

  const fetchReasons = async () => {
    setIsLoading(prev => ({ ...prev, reasons: true }))
    setError(prev => ({ ...prev, reasons: '' }))
    try {
      const response = await getAppointmentReasons({});
      // Assuming response.response is the array you posted
      const reasonOptions = Array.isArray(response)
        ? response.map(r => ({ value: r.reasonID, label: r.reasonName }))
        : [];
      setReasons(reasonOptions);
    } catch (error) {
      setError(prev => ({ ...prev, reasons: 'Failed to load reasons' }));
    } finally {
      setIsLoading(prev => ({ ...prev, reasons: false }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Appointment form submitted:', appointmentData)
  
    // Validate that all required fields are filled
    if (appointmentData.location && appointmentData.provider && appointmentData.reason) {
      try {
        // Get current date and one month later date
        const currentDate = new Date()
        const oneMonthLater = new Date()
        oneMonthLater.setMonth(currentDate.getMonth() + 1)
  
        // Format dates as strings (YYYY-MM-DD)
        const fromDate = currentDate.toISOString().split('T')[0]
        const toDate = oneMonthLater.toISOString().split('T')[0]
  
        // Call getAvailableDates API
        const availableDatesResponse = await getAvailableDates({
          from_date: fromDate,
          to_date: toDate,
          location_id: appointmentData.location,
          provider_id: appointmentData.provider,
          reason_id: appointmentData.reason,
          path: window.location.pathname
        })
   localStorage.setItem('appointmentSelections', JSON.stringify(appointmentData));
        // Navigate to calendar page with form data, appointment data, and available dates
        navigate('/calendar', {
          state: {
            ...location.state,
            formData,
            appointmentData,
            availableDates: 'response' in availableDatesResponse ? availableDatesResponse.response : []
          }
        })
      } catch (error) {
        console.error('Error fetching available dates:', error)
        alert('Failed to fetch available dates. Please try again.')
      }
    } else {
      // Show an alert if any required field is missing
      alert('Please fill in all required fields')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-600">Appointment Details</h2>
            <button onClick={() => navigate('/')} className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {(error.locations || error.providers || error.reasons) && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error.locations && <p>{error.locations}</p>}
              {error.providers && <p>{error.providers}</p>}
              {error.reasons && <p>{error.reasons}</p>}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="location" className="block text-gray-700 mb-1">
                Location<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="location"
                  name="location"
                  value={appointmentData.location}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                  required
                  disabled={isLoading.locations}
                >
                  <option value="" disabled>Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  {isLoading.locations ? (
                    <span className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></span>
                  ) : (
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="provider" className="block text-gray-700 mb-1">
                Provider<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="provider"
                  name="provider"
                  value={appointmentData.provider}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                  required
                  disabled={isLoading.providers || !appointmentData.location}
                >
                  <option value="" disabled>Select Provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  {isLoading.providers ? (
                    <span className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></span>
                  ) : (
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="reason" className="block text-gray-700 mb-1">
                Reason<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="reason"
                  name="reason"
                  value={appointmentData.reason}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                  required
                  disabled={isLoading.reasons}
                >
                  <option value="" disabled>Select Reason</option>
                  {reasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>{reason.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  {isLoading.reasons ? (
                    <span className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></span>
                  ) : (
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate('/otp')}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
              >
                BACK
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                disabled={isLoading.locations || isLoading.providers || isLoading.reasons}
              >
                NEXT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AppointmentPage
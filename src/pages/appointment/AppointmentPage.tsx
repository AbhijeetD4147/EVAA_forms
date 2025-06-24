import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AppointmentPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const formData = location.state?.formData || {}
  
  const [appointmentData, setAppointmentData] = useState({
    location: '',
    provider: '',
    reason: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Appointment form submitted:', appointmentData)
    
    // Validate that all required fields are filled
    if (appointmentData.location && appointmentData.provider && appointmentData.reason) {
      // Navigate to calendar page with both form data and appointment data
      navigate('/calendar', { 
        state: { 
          formData,
          appointmentData 
        } 
      })
    } else {
      // Show an alert if any required field is missing
      alert('Please fill in all required fields')
    }
  }

  // Sample data for dropdowns
  const locations = ['Location 1', 'Location 2', 'Location 3']
  const providers = ['Provider 1', 'Provider 2', 'Provider 3']
  const reasons = ['Reason 1', 'Reason 2', 'Reason 3']

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
                >
                  <option value="" disabled>Select Location</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
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
                >
                  <option value="" disabled>Select Provider</option>
                  {providers.map((provider, index) => (
                    <option key={index} value={provider}>{provider}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
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
                >
                  <option value="" disabled>Select Reason</option>
                  {reasons.map((reason, index) => (
                    <option key={index} value={reason}>{reason}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
              >
                BACK
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
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
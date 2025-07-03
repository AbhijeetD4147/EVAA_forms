import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { validateOtp } from '../../services/api/otpService'
import { getCustomerIdFromDetails } from '../../services/api/customerService'

// Fixed session ID to use for all API calls
const SESSION_ID = '65c03d61-461e-4ad7-bc73-9e5ec43ccc28';

// Add these constants at the top of your file, or import them from App.tsx
const BOT_ID = 'QApixW';
const DEFAULT_PRACTICE = 'burneteyecarepinecone';

const OtpValidationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const formData = location.state?.formData || {}
  // Use the fixed session ID instead of getting it from location state
  const [otpValues, setOtpValues] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)
    setError('') // Clear error when user types

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otpValues.join('')
    
    if (otpCode.length !== 4) {
      setError('Please enter a complete 4-digit code')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      // Call the validateOtp API with the fixed session ID and correct path
      const response = await validateOtp({
        path: `/${DEFAULT_PRACTICE}/${BOT_ID}`, // Use actual practice and bot ID
        otp: otpCode,
        session_id: SESSION_ID,
        phone_number: formData.phoneNumber,
        email_id: formData.email
      })
      
      console.log('OTP validation response:', response)
      
      // Handle both string and object responses
      let isValidated = false;
      
      if (typeof response === 'string') {
        // Direct string response
        isValidated = response.includes('validated successfully');
      } else if (response && typeof response === 'object') {
        // Object response - check various possible properties
        if ('response' in response && typeof response.response === 'string') {
          isValidated = response.response.includes('validated successfully');
        } else if (response.success || response.isValid) {
          isValidated = true;
        }
      }
      
      if (isValidated) {
        // After successful OTP validation, get customer ID
        try {
          const customerResponse = await getCustomerIdFromDetails({
            first_name: formData.firstName,
            last_name: formData.lastName,
            dob: formData.dob,
            phone_number: formData.phoneNumber,
            email: formData.email,
            session_id: SESSION_ID,
            path: '/practice/bot-id' // Replace with actual path
          })
          
          console.log('Customer ID response:', customerResponse)
          
          // Store the customer ID in the formData
          const updatedFormData = {
            ...formData,
            customerId: ('response' in customerResponse) ? customerResponse.response : null
          }
          
          // Navigate to appointment page with updated form data including customer ID
          navigate('/appointment', { state: { formData: updatedFormData } })
        } catch (customerError) {
          console.error('Error getting customer ID:', customerError)
          setError('Failed to retrieve customer information. Please try again.')
          setIsLoading(false)
        }
      } else {
        setError('Invalid OTP. Please try again.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error validating OTP:', error)
      setError('Failed to validate OTP. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        {/* Content */}
        <div className="p-6">
    
          <h3 className="text-xl font-semibold text-center mb-4">Verification Code</h3>
          
          <p className="text-center text-gray-600 mb-6">
            Please validate OTP sent to entered mobile number and Email address.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center space-x-2 mb-8">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus={index === 0}
                  disabled={isLoading}
                />
              ))}
            </div>
            
            {error && (
              <p className="text-red-500 text-center mb-4">{error}</p>
            )}
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/form')}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OtpValidationPage
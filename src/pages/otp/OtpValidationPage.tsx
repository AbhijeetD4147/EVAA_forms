import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const OtpValidationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const formData = location.state?.formData || {}
  const [otpValues, setOtpValues] = useState(['', '', '', ''])
  const [error, setError] = useState('')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otpValues.join('')
    console.log('OTP submitted:', otpCode)
    
    // Check if OTP matches the dummy value (1234)
    if (otpCode === '1234') {
      // Navigate to appointment page with form data
      navigate('/appointment', { state: { formData } })
    } else if (otpCode.length === 4) {
      setError('Invalid OTP. Please try again.')
    } else {
      setError('Please enter a complete 4-digit code')
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
                />
              ))}
            </div>
            
            {error && (
              <p className="text-red-500 text-center mb-4">{error}</p>
            )}

            <div className="text-center text-sm text-gray-500 mb-4">
              <p>Use dummy OTP: 1234</p>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/form')}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OtpValidationPage
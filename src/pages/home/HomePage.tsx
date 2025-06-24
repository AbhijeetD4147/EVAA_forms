import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">EVAA Virtual Assistant</h1>
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => navigate('/form')}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors"
        >
          Open Personal Information Form
        </button>
        <button
          onClick={() => navigate('/appointment')}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
        >
          Open Appointment Form
        </button>
        <button
          onClick={() => navigate('/calendar')}
          className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-md hover:bg-purple-600 transition-colors"
        >
          Open Date Range Calendar
        </button>
        <button
          onClick={() => navigate('/timeslot')}
          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
        >
          Open Time Slot Selection
        </button>
        <button
          onClick={() => navigate('/otp')}
          className="px-6 py-3 bg-orange-500 text-black font-semibold rounded-md hover:bg-orange-600 transition-colors"
        >
          Open OTP Validation
        </button>
      </div>
    </div>
  )
}

export default HomePage
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { bookAppointment } from '../../services/api/appointmentService';

interface OpenSlot {
  openSlotId: number;
  apptStartDateTime: string;
  apptEndDateTime: string;
  displayTime: string;
  slotDuration: string;
}
const SESSION_ID = '65c03d61-461e-4ad7-bc73-9e5ec43ccc28';
const TimeSlotPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { dateRange, availableSlots } = location.state || { 
    dateRange: { startDate: null, endDate: null },
    availableSlots: []
  }
  
  const [selectedDate, setSelectedDate] = useState<string | null>(dateRange?.startDate || null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null)
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('Morning')
  
  // Generate array of dates in the range
  const getDatesInRange = () => {
    if (!dateRange.startDate) return []
    
    const dates = []
    const start = new Date(dateRange.startDate)
    
    if (!dateRange.endDate) {
      return [dateRange.startDate]
    }
    
    const end = new Date(dateRange.endDate)
    let current = new Date(start)
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }
  
  const datesInRange = getDatesInRange()
  
  // Format the date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Generate time slots based on time of day
  // Replace the generateTimeSlots function
  const generateTimeSlots = () => {
    if (!availableSlots || !Array.isArray(availableSlots)) return [];
    
    return availableSlots.filter((slot: OpenSlot) => {
      const slotDate = new Date(slot.apptStartDateTime).toISOString().split('T')[0]
      if (slotDate !== selectedDate) return false;
      
      const hour = new Date(slot.apptStartDateTime).getHours()
      if (selectedTimeOfDay === 'Morning') return hour >= 7 && hour < 12
      if (selectedTimeOfDay === 'Afternoon') return hour >= 12 && hour < 17
      if (selectedTimeOfDay === 'Evening') return hour >= 17 && hour <= 20
      return false
    })
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  const handleTimeSlotClick = (slot: OpenSlot) => {
    setSelectedTimeSlot(slot.openSlotId)
  }

  const handleFinishBooking = async () => {
    if (!selectedDate || !selectedTimeSlot) return;
    
    // Get data from localStorage
    const formData = JSON.parse(localStorage.getItem('appointmentFormData') || '{}');
    const appointmentData = JSON.parse(localStorage.getItem('appointmentSelections') || '{}');
    const dateData = JSON.parse(localStorage.getItem('appointmentDate') || '{}');
    
    // Construct the payload with all required fields
    const payload = {
      OpenSlotId: String(selectedTimeSlot), // Convert to string to match API format
      ApptDate: selectedDate,
      ReasonId: appointmentData.reason || '',
      FirstName: formData.firstName || '',
      LastName: formData.lastName || '',
      PatientDob: formData.dob || '',
      MobileNumber: formData.phoneNumber || '',
      EmailId: formData.email || '',
      SessionID: formData.sessionId || '',
      resourceId: appointmentData.provider || '',
      locationId: appointmentData.location || '',
      isNewPatient: String(formData.isNewPatient || false) // Convert to string to match API format
    };

    try {
      const result = await bookAppointment({
        open_slot_id: String(selectedTimeSlot),
        from_date: selectedDate,
        reason_id: appointmentData.reason || '',
        first_name: formData.firstName || '',
        last_name: formData.lastName || '',
        email_id: formData.email || '',
        phone_number: formData.phoneNumber || '',
        dob: formData.dob || '',
        session_id: formData.sessionId || SESSION_ID,
        isNewPatient: formData.isNewPatient || false,
        selected_location_name: appointmentData.location || '',
        selected_provider_pame: appointmentData.provider || '',
        resourceId: appointmentData.provider || '',
        location_selected: appointmentData.location || '',
        path: location.state?.path || ''
      });

      if (result && result.response === 'Appointment scheduled successfully.') {
        // Clear localStorage after successful booking
        localStorage.removeItem('appointmentFormData');
        localStorage.removeItem('appointmentSelections');
        localStorage.removeItem('appointmentDate');
        
        navigate('/');
      } else {
        alert(result.usermessage || 'Booking failed.');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-600">Choose Time Slot</h2>
            <button onClick={() => navigate('/calendar')} className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Time slot content remains the same */}
          {datesInRange.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date:</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate || ''}
                onChange={(e) => handleDateChange(e.target.value)}
              >
                {datesInRange.map((date) => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected Date Display */}
          <div className="mb-4 text-gray-600 flex items-center">
            <span>{formatDate(selectedDate)}</span>
            <span className="mx-2">|</span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              15 mins
            </span>
          </div>

          {/* Time of Day Selector */}
          <div className="flex mb-4 border-b border-gray-200">
            {['Morning', 'Afternoon', 'Evening'].map((timeOfDay) => (
              <button
                key={timeOfDay}
                type="button"
                className={`flex-1 py-2 px-4 text-center ${selectedTimeOfDay === timeOfDay ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                onClick={() => setSelectedTimeOfDay(timeOfDay)}
              >
                {timeOfDay}
              </button>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {generateTimeSlots().map((slot: OpenSlot) => (
              <button
                key={slot.openSlotId}
                type="button"
                className={`p-3 rounded-md text-center ${selectedTimeSlot === slot.openSlotId ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                onClick={() => handleTimeSlotClick(slot)}
              >
                {slot.displayTime}
                <div className="text-xs">{slot.slotDuration}</div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              BACK
            </button>
            <button
              type="button"
              onClick={handleFinishBooking}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              disabled={!selectedTimeSlot}
            >
              FINISH BOOKING
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeSlotPage
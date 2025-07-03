import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getOpenSlots } from '../../services/api/appointmentService';

const CalendarPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [dateRange, setDateRange] = useState<{ startDate: string | null, endDate: string | null }>({
    startDate: null,
    endDate: null
  })
  const [availableDates, setAvailableDates] = useState<string[]>([])

  useEffect(() => {
    // Get available dates from location state
    const state = location.state
    if (state?.availableDates) {
      // Map array of objects to array of date strings if needed
      if (Array.isArray(state.availableDates) && typeof state.availableDates[0] === 'object' && state.availableDates[0].AVAILABLE_DATES) {
        setAvailableDates(state.availableDates.map((d: any) => d.AVAILABLE_DATES))
      } else {
        setAvailableDates(state.availableDates)
      }
    }
  }, [])

  // Generate days for the current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
    const firstDayOfMonth = getFirstDayOfMonth(selectedYear, selectedMonth)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const isDateAvailable = (day: number) => {
    if (!day) return false
    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return availableDates.includes(dateString)
  }

  const handleDateClick = (day: number) => {
    if (!day || !isDateAvailable(day)) return

    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      // Start a new range
      setDateRange({
        startDate: dateString,
        endDate: null
      })
    } else {
      // Complete the range
      // Ensure endDate is after startDate
      const startDate = new Date(dateRange.startDate)
      const clickedDate = new Date(dateString)

      // Calculate the difference in days
      const diffTime = Math.abs(clickedDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays >= 7) {
        alert('Date range cannot exceed 7 days. Please select a shorter range.')
        setDateRange({
          startDate: dateString,
          endDate: null
        })
      } else if (clickedDate < startDate) {
        setDateRange({
          startDate: dateString,
          endDate: dateRange.startDate
        })
      } else {
        setDateRange({
          ...dateRange,
          endDate: dateString
        })
      }
    }
  }

  const isDateInRange = (day: number) => {
    if (!day || !dateRange.startDate) return false

    const currentDate = new Date(selectedYear, selectedMonth, day)
    const startDate = new Date(dateRange.startDate)

    if (!dateRange.endDate) {
      return currentDate.toDateString() === startDate.toDateString()
    }

    const endDate = new Date(dateRange.endDate)
    return currentDate >= startDate && currentDate <= endDate
  }

  const isStartDate = (day: number) => {
    if (!day || !dateRange.startDate) return false
    const currentDate = new Date(selectedYear, selectedMonth, day)
    const startDate = new Date(dateRange.startDate)
    return currentDate.toDateString() === startDate.toDateString()
  }

  const isEndDate = (day: number) => {
    if (!day || !dateRange.endDate) return false
    const currentDate = new Date(selectedYear, selectedMonth, day)
    const endDate = new Date(dateRange.endDate)
    return currentDate.toDateString() === endDate.toDateString()
  }

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange.startDate) return;

    try {
      // Get the required parameters from location state or props
      const state = location.state;
      const apiData = {
        from_date: dateRange.startDate,
        to_date: dateRange.startDate, // Using same date as from_date
        location_id: state?.location_id || '',
        provider_id: state?.provider_id || '',
        reason_id: state?.reason_id || '',
        path: state?.path || '',
        session_id: state?.session_id || ''
      };

      // Call the API
      const response = await getOpenSlots(apiData);
      localStorage.setItem('appointmentDate', JSON.stringify(dateRange));
      // Navigate to timeslot page with the retrieved slots
      navigate('/timeslot', {
        state: {
          ...location.state,
          dateRange: dateRange,
          formData: location.state?.formData, // ensure formData is passed
          appointmentData: location.state?.appointmentData, // ensure appointmentData is passed
          // add selected date range
          selectedDate,
          availableSlots: 'response' in response ? response.response : null
        }
      });
    } catch (error) {
      console.error('Error fetching open slots:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md overflow-hidden">
        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-600">Select Date</h2>
            <button onClick={() => navigate('/')} className="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Calendar content remains the same */}
          <div className="bg-blue-600 text-white p-3 rounded-t-md">
            <div className="text-center font-bold">{selectedYear}</div>
          </div>

          {/* Month Navigation */}
          <div className="flex justify-between items-center p-3 bg-gray-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="font-semibold">{monthNames[selectedMonth]} {selectedYear}</div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-2 border border-gray-200 rounded-b-md">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-gray-500 text-sm py-1">{day}</div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((day, index) => (
                <div
                  key={index}
                  className={`
                    text-center py-2 rounded-md
                    ${!day ? 'invisible' : ''}
                    ${!isDateAvailable(day as number) ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                    ${isDateInRange(day as number) ? 'bg-blue-100' : isDateAvailable(day as number) ? 'hover:bg-gray-100' : ''}
                    ${isStartDate(day as number) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${isEndDate(day as number) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  `}
                  onClick={() => day && handleDateClick(day as number)}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Date Range Display */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <div className="font-semibold mb-2">Selected Date Range:</div>
            <div className="text-sm">
              <div>Start: {dateRange.startDate ? formatDate(dateRange.startDate) : 'Not selected'}</div>
              <div>End: {dateRange.endDate ? formatDate(dateRange.endDate) : 'Not selected'}</div>
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
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              disabled={!dateRange.startDate}
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarPage
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/home/HomePage'
import FormPage from './pages/form/FormPage'
import AppointmentPage from './pages/appointment/AppointmentPage'
import CalendarPage from './pages/calendar/CalendarPage'
import TimeSlotPage from './pages/timeslot/TimeSlotPage'
import OtpValidationPage from './pages/otp/OtpValidationPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
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

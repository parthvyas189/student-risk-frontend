import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import TeacherDashboard from './pages/TeacherDashboard';
import WeeklyUpdates from './pages/WeeklyUpdates';
import StudentsPage from './pages/StudentsPage'; // <--- IMPORT

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/updates" element={<WeeklyUpdates />} />
          <Route path="/students" element={<StudentsPage />} /> {/* <--- CONNECTED */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
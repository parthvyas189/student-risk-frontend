import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import TeacherDashboard from './pages/TeacherDashboard'; // <-- Import

// Keep other placeholders for now
const WeeklyUpdates = () => <div className="text-2xl font-bold">📝 Update Form Coming Soon</div>;
const Students = () => <div className="text-2xl font-bold">🎓 Student List Coming Soon</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<DashboardLayout />}>
          {/* Use the new TeacherDashboard here */}
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/updates" element={<WeeklyUpdates />} />
          <Route path="/students" element={<Students />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
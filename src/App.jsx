import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';

// Placeholders
const Dashboard = () => <div className="text-2xl font-bold">📊 Dashboard Coming Soon</div>;
const WeeklyUpdates = () => <div className="text-2xl font-bold">📝 Update Form Coming Soon</div>;
const Students = () => <div className="text-2xl font-bold">🎓 Student List Coming Soon</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/updates" element={<WeeklyUpdates />} />
          <Route path="/students" element={<Students />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
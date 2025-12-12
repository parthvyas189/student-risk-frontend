import { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle, Eye, FileText } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingUpdates: 0,
    highRiskCount: 0,
    updatesDone: '0%'
  });
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch all students
        const studentsRes = await api.get('/students/');
        const allStudents = studentsRes.data;

        // Get logged in teacher ID from local storage
        const currentTeacherId = localStorage.getItem('user_id');

        // Filter students to only include those assigned to this teacher
        const students = currentTeacherId 
            ? allStudents.filter(s => s.teacher_id === parseInt(currentTeacherId))
            : []; 
        
        let highRisk = 0;
        let riskList = [];
        
        // 2. For each student, get their risk history (Limit to top 5 for performance in POC)
        const riskPromises = students.map(s => api.get(`/students/${s.id}/history`));
        const histories = await Promise.all(riskPromises);

        histories.forEach((res, index) => {
          const history = res.data;
          const student = students[index];
          
          if (history && history.length > 0) {
            // Get latest record
            const latest = history[0]; 
            
            if (latest.risk_level === 'High') highRisk++;
            
            // Add to risk list if Medium or High
            if (latest.risk_level === 'High' || latest.risk_level === 'Medium') {
                // Parse reasons if they are JSON string
                let reasons = [];
                try {
                    reasons = JSON.parse(latest.risk_reasons);
                } catch (e) {
                    reasons = [latest.risk_reasons];
                }

                riskList.push({
                    id: student.id,
                    name: student.name,
                    class: student.roll_number, // Using roll number as class proxy
                    issue: reasons[0] || 'General Risk',
                    risk: latest.risk_level,
                    score: latest.risk_score, // Stored for sorting
                    color: latest.risk_level === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                });
            }
          }
        });

        // --- SORTING LOGIC ---
        // Sort by risk score descending (Highest risk first)
        riskList.sort((a, b) => b.score - a.score);

        // --- LIMITING LOGIC ---
        // Limit to top 5 students for the dashboard widget
        const topRiskStudents = riskList.slice(0, 5);

        setStats({
            totalStudents: students.length,
            pendingUpdates: 0, 
            highRiskCount: highRisk,
            updatesDone: '100%' 
        });

        setAtRiskStudents(topRiskStudents);

        // Mock Chart Data
        setChartData({
            labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
            datasets: [
              {
                label: 'Avg Attendance',
                data: [92, 88, 89, 85, 88, 91],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
              },
            ],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: { min: 60, max: 100 },
    },
  };

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor student progress and submit weekly updates</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <FileText size={18} />
          Submit Weekly Update
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Assigned Students</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalStudents}</h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Users size={24} />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Updates</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingUpdates}</h3>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">High Risk</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.highRiskCount}</h3>
            </div>
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Updates Done</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.updatesDone}</h3>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Class Performance Trends</h3>
          <p className="text-gray-400 text-sm mb-6">Weekly attendance averages</p>
          <div className="h-64">
            {chartData && <Line data={chartData} options={chartOptions} />}
          </div>
        </div>

        {/* Right: Students at Risk */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="text-lg font-bold text-gray-800">Students at Risk</h3>
          </div>
          
          <div className="space-y-4">
            {atRiskStudents.length === 0 ? (
                <p className="text-gray-500 text-sm">No students currently flagged as high risk.</p>
            ) : (
                atRiskStudents.map((student) => (
                <div key={student.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-bold text-gray-800">{student.name}</h4>
                        <p className="text-xs text-gray-500">{student.class}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${student.color}`}>
                        {student.risk} Risk
                    </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{student.issue}</p>
                    <button className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline">
                    <Eye size={14} /> View Details
                    </button>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
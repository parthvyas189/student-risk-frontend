import { useState, useEffect } from 'react';
import { Search, Filter, FileText } from 'lucide-react';
import api from '../services/api';
import StudentDetailModal from '../components/StudentDetailModal';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // 1. Fetch Students
        const res = await api.get('/students/');
        const currentTeacherId = localStorage.getItem('user_id');
        const myStudents = currentTeacherId 
            ? res.data.filter(s => s.teacher_id === parseInt(currentTeacherId))
            : [];

        // 2. Fetch Risk Info & Latest Metrics for each
        const enriched = await Promise.all(myStudents.map(async (s) => {
            try {
                // Parallel fetch: Get History (Risk) and Metrics (Raw Data)
                const [historyRes, metricsRes] = await Promise.all([
                    api.get(`/students/${s.id}/history`),
                    api.get(`/students/${s.id}/metrics`)
                ]);

                const latestRisk = historyRes.data[0]; // Most recent risk entry
                const latestMetric = metricsRes.data[0]; // Most recent weekly data (metrics endpoint is sorted desc)

                return {
                    ...s,
                    risk: latestRisk ? latestRisk.risk_level : 'Low',
                    score: latestRisk ? latestRisk.risk_score : 0.0, // REAL SCORE
                    
                    // REAL METRICS (Latest week)
                    attendance: latestMetric ? latestMetric.attendance_score : 0, 
                    assignment: latestMetric ? latestMetric.homework_submission_rate : 0,
                    
                    issue: latestRisk ? latestRisk.risk_reasons : 'No recent data'
                };
            } catch (e) {
                console.error(`Error fetching data for student ${s.id}`, e);
                return { ...s, risk: 'Low', score: 0.0, attendance: 0, assignment: 0 };
            }
        }));

        setStudents(enriched);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter Logic
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Students</h1>
        <p className="text-gray-500 mt-1">View detailed risk insights and progress for your students</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search students..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && <div className="text-center py-10">Loading students...</div>}

      {/* Grid of Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const isHigh = student.risk === 'High';
            const isMed = student.risk === 'Medium';
            const badgeColor = isHigh ? 'bg-red-500' : isMed ? 'bg-orange-500' : 'bg-green-500';

            return (
              <button 
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-left group w-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{student.name}</h3>
                      <p className="text-xs text-gray-500">{student.roll_number}</p>
                    </div>
                  </div>
                  <span className={`${badgeColor} text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase`}>
                    {student.risk} Risk
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <FileText size={12} /> Attendance
                    </div>
                    <p className="font-bold text-gray-800">{student.attendance}%</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <FileText size={12} /> Assignments
                    </div>
                    <p className="font-bold text-gray-800">{student.assignment}%</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* THE OVERLAY */}
      {selectedStudent && (
        <StudentDetailModal 
            student={selectedStudent} 
            onClose={() => setSelectedStudent(null)} 
        />
      )}

    </div>
  );
};

export default StudentsPage;
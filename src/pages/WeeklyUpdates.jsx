import { useState, useEffect } from 'react';
import { FileText, Upload, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const WeeklyUpdates = () => {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'upload'
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    attendance: '',
    assignment_score: '',
    missing_assignments: '',
    late_submissions: '',
    homework_status: 'Completed', // Default
    fees_pending: false,
    ptm_presence: true,
    behavior_issue: false
  });

  // Fetch students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students/');
        // Filter for current teacher
        const currentTeacherId = localStorage.getItem('user_id');
        const myStudents = currentTeacherId 
            ? res.data.filter(s => s.teacher_id === parseInt(currentTeacherId))
            : [];
        setStudents(myStudents);
      } catch (err) {
        console.error("Failed to load students", err);
      }
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Map form data to Backend Schema (WeeklyMetricInput)
      // Note: We are mapping "Homework Status" string to a percentage for the backend
      let hwRate = 100;
      if (formData.homework_status === 'Partial') hwRate = 50;
      if (formData.homework_status === 'Missing') hwRate = 0;

      const payload = {
        student_id: formData.student_id,
        week_start_date: new Date().toISOString().split('T')[0], // Today
        attendance_score: parseInt(formData.attendance),
        homework_submission_rate: hwRate,
        test_score_average: parseInt(formData.assignment_score),
        behavior_flag: formData.behavior_issue
      };

      await api.post('/metrics/', payload);
      
      setSuccessMsg('Weekly update submitted successfully! Risk analysis updated.');
      // Reset sensitive fields
      setFormData(prev => ({
        ...prev, 
        attendance: '', 
        assignment_score: '', 
        behavior_issue: false
      }));

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Weekly Updates</h1>
        <p className="text-gray-500 mt-1">Submit student progress data for risk analysis</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'manual' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={18} />
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'upload' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload size={18} />
          Excel Upload
        </button>
      </div>

      {/* MANUAL ENTRY FORM */}
      {activeTab === 'manual' && (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm transition-all animate-fade-in">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Manual Weekly Update</h2>
          <p className="text-gray-400 text-sm mb-6">Enter individual student progress data</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Student Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
              <select 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.student_id}
                onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                required
              >
                <option value="">Choose a student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>
                ))}
              </select>
            </div>

            {/* Scores Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendance %</label>
                <input 
                  type="number" min="0" max="100" placeholder="e.g., 85"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.attendance}
                  onChange={(e) => setFormData({...formData, attendance: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Score %</label>
                <input 
                  type="number" min="0" max="100" placeholder="e.g., 78"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.assignment_score}
                  onChange={(e) => setFormData({...formData, assignment_score: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Assignments Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Missing Assignments</label>
                <input 
                  type="number" min="0" placeholder="e.g., 2"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.missing_assignments}
                  onChange={(e) => setFormData({...formData, missing_assignments: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Late Submissions</label>
                <input 
                  type="number" min="0" placeholder="e.g., 1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.late_submissions}
                  onChange={(e) => setFormData({...formData, late_submissions: e.target.value})}
                />
              </div>
            </div>

            {/* Homework Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Homework Status</label>
              <select 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.homework_status}
                onChange={(e) => setFormData({...formData, homework_status: e.target.value})}
              >
                <option value="Completed">Completed</option>
                <option value="Partial">Partial</option>
                <option value="Missing">Missing</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="block text-sm font-medium text-gray-700">Fees Pending</span>
                        <span className="text-xs text-gray-400">Does the student have pending fees?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" 
                            checked={formData.fees_pending}
                            onChange={(e) => setFormData({...formData, fees_pending: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="block text-sm font-medium text-gray-700">Behavioral Issue</span>
                        <span className="text-xs text-gray-400">Any disciplinary incidents this week?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" 
                            checked={formData.behavior_issue}
                            onChange={(e) => setFormData({...formData, behavior_issue: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Submit Update
                </button>
            </div>

            {/* Messages */}
            {successMsg && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle size={20} /> {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} /> {errorMsg}
                </div>
            )}

          </form>
        </div>
      )}

      {/* UPLOAD PLACEHOLDER */}
      {activeTab === 'upload' && (
        <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center border-dashed border-2 border-gray-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Upload Excel File</h3>
            <p className="text-gray-500 mt-2">Drag and drop your weekly report here, or click to browse.</p>
            <button className="mt-6 px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-4">Supported formats: .xlsx, .csv</p>
        </div>
      )}

    </div>
  );
};

export default WeeklyUpdates;
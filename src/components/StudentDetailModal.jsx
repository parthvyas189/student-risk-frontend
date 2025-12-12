import { X, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';

const StudentDetailModal = ({ student, onClose }) => {
  if (!student) return null;

  // Mock Trend Data (Keeping this mock for now as requested, but logic is ready for real data)
  const chartData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    datasets: [
      {
        label: 'Attendance',
        data: [90, 88, 85, 82, 78, 75], 
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 100 } },
    maintainAspectRatio: false,
  };

  // Determine colors based on risk
  const isHighRisk = student.risk === 'High';
  const riskBg = isHighRisk ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100';
  const riskText = isHighRisk ? 'text-red-700' : 'text-green-700';
  const badgeColor = isHighRisk ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-500 text-sm">{student.roll_number} • Student</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Risk Assessment Box */}
          <div className={`p-6 rounded-xl border ${riskBg}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className={riskText} size={20} />
                <h3 className={`font-bold ${riskText}`}>Risk Assessment</h3>
              </div>
              <div className="flex items-center gap-3">
                {/* DISPLAY REAL SCORE */}
                <span className="text-3xl font-bold text-gray-800">
                    {(student.score * 100).toFixed(0)}
                </span>
                <span className={`${badgeColor} text-white text-xs px-2 py-1 rounded-md font-bold uppercase`}>
                  {student.risk} Risk
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Risk Factors:</p>
              <div className="flex flex-wrap gap-2">
                {/* DISPLAY REAL FACTORS */}
                {(() => {
                    try {
                        const reasons = typeof student.issue === 'string' && student.issue.startsWith('[') 
                            ? JSON.parse(student.issue) 
                            : (student.issue ? [student.issue] : []);
                        
                        if (reasons.length === 0) return <span className="text-xs text-gray-500">No specific factors identified.</span>;

                        return reasons.map((r, i) => (
                            <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                                {r}
                            </span>
                        ));
                    } catch (e) {
                        return <span className="text-xs text-gray-500">{student.issue || 'None'}</span>;
                    }
                })()}
              </div>
            </div>
          </div>

          {/* Charts Grid (Mock for now) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-bold text-gray-800 mb-4">Attendance Trend</h4>
              <div className="h-48">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-sm font-bold text-gray-800 mb-4">Assignment Trend</h4>
              <div className="h-48">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-4">Homework Consistency</h4>
            <div className="h-32">
                <Line data={chartData} options={chartOptions} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
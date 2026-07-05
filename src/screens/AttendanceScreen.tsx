import { useState } from 'react';
import MustPageBackground from '../components/MustPageBackground';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { ClipboardCheck, QrCode, UserCheck, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AttendanceScreen() {
  const { attendanceRecords, markAttendance, user } = useApp();

  const [view, setView] = useState<'history' | 'qr' | 'manual'>('history');
  const isLecturer = user?.role === 'lecturer';
  const [selectedQrCourse, setSelectedQrCourse] = useState('TE411 - Telecommunication Systems I');
  const [manualCourse, setManualCourse] = useState('TE411 - Telecommunication Systems I');
  const [studentStatuses, setStudentStatuses] = useState<Record<string, 'present' | 'late' | 'absent'>>({});

  const handleGenerateQR = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#000000';
    const cell = 160 / 11;
    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        if ((r * 11 + c * 7 + r * 3 + c * 11) % 3 !== 0) {
          ctx.fillRect(20 + c * cell, 20 + r * cell, cell, cell);
        }
      }
    }
    [[0,0,7,7],[0,4,7,4],[4,0,4,7]].forEach(([rx,ry,w,h]) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(20 + rx * cell, 20 + ry * cell, w * cell, h * cell);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20 + (rx + 1) * cell, 20 + (ry + 1) * cell, (w - 2) * cell, (h - 2) * cell);
      ctx.fillStyle = '#000000';
      ctx.fillRect(20 + (rx + 2) * cell, 20 + (ry + 2) * cell, (w - 4) * cell, (h - 4) * cell);
    });
    const imgUrl = canvas.toDataURL('image/png');
    const w = window.open('', '_blank', 'width=400,height=500');
    if (w) {
      w.document.write('<html><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;background:white;padding:20px">' +
        '<h2 style="margin-bottom:10px">Scan to Mark Attendance</h2>' +
        '<p style="color:#666;margin-bottom:20px">' + selectedQrCourse + '</p>' +
        '<img src="' + imgUrl + '" style="width:250px;height:250px;image-rendering:pixelated" />' +
        '<p style="margin-top:20px;color:#888;font-size:12px">Valid for: 60 seconds</p>' +
        '<button onclick="window.close()" style="margin-top:10px;padding:8px 24px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer">Close</button>' +
        '</body></html>');
      w.document.close();
    }
  };

  const totalRecords = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
  const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <MustPageBackground variant="default" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {isLecturer ? 'Manage & Track' : 'Your'} Attendance Records
          </p>
        </div>
        {isLecturer && (
          <div className="flex gap-2">
            <button onClick={() => setView('qr')} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2', view === 'qr' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>
              <QrCode className="w-4 h-4" /> QR Code
            </button>
            <button onClick={() => setView('manual')} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2', view === 'manual' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>
              <UserCheck className="w-4 h-4" /> Manual
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: TrendingUp, label: 'Attendance Rate', value: `${attendanceRate}%`, color: 'bg-green-600', sub: `${presentCount}/${totalRecords} classes` },
          { icon: CheckCircle, label: 'Present', value: presentCount, color: 'bg-green-500', sub: 'on time' },
          { icon: Clock, label: 'Late', value: lateCount, color: 'bg-orange-500', sub: 'arrived late' },
          { icon: XCircle, label: 'Absent', value: absentCount, color: 'bg-red-500', sub: 'missed' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="w-4 h-4 text-white" /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* QR Code Generator (Lecturer) */}
      {view === 'qr' && isLecturer && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Generate QR Code for Attendance</h3>
          <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 mb-4">
            <QrCode className="w-24 h-24 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Display this QR code in class. Students scan to mark attendance.</p>
          <div className="flex items-center justify-center gap-3">
            <select value={selectedQrCourse} onChange={e => setSelectedQrCourse(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none">
              <option>TE411 - Telecommunication Systems I</option>
              <option>TE412 - Digital Signal Processing</option>
              <option>TE413 - Microwave Engineering</option>
              <option>TE414 - Optical Fiber Communications</option>
              <option>TE415 - Wireless Communication Networks</option>
            </select>
            <button onClick={handleGenerateQR} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">Generate</button>
          </div>
        </div>
      )}

      {/* Manual Attendance (Lecturer) */}
      {view === 'manual' && isLecturer && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Mark Manual Attendance</h3>
          <div className="space-y-3">
            <select value={manualCourse} onChange={e => setManualCourse(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none">
              <option>TE411 - Telecommunication Systems I</option>
              <option>TE412 - Digital Signal Processing</option>
              <option>TE413 - Microwave Engineering</option>
              <option>TE414 - Optical Fiber Communications</option>
              <option>TE415 - Wireless Communication Networks</option>
            </select>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
              {['Juma Hassan', 'Neema Mwangi', 'Baraka Kimaro', 'Amina Juma', 'David Oloo'].map((name) => (
                <div key={name} className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
                  <div className="flex gap-1">
                    {(['present', 'late', 'absent'] as const).map(status => (
                      <button key={status} onClick={() => setStudentStatuses(prev => ({ ...prev, [name]: status }))} className={cn('px-3 py-1 rounded-lg text-xs font-medium capitalize', (studentStatuses[name] || '') === status ? status === 'present' ? 'bg-green-600 text-white' : status === 'late' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white' : status === 'present' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200' : status === 'late' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-200' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200')}>{status}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { const count = Object.keys(studentStatuses).length; if (count === 0) { alert('Please mark attendance for at least one student.'); return; } Object.entries(studentStatuses).forEach(([name, status]) => { markAttendance({ courseId: 'c-manual', courseName: manualCourse, studentId: name, studentName: name, status, method: 'manual' }); }); alert(`Attendance saved for ${count} student(s)!`); setStudentStatuses({}); }} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">Save Attendance</button>
          </div>
        </div>
      )}

      {/* Attendance History */}
      {(view === 'history' || !isLecturer) && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Attendance History</h3>
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No attendance records yet</p>
            </div>
          ) : (
            attendanceRecords.map((record) => {

              const statusColors = {
                present: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                late: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
                absent: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                excused: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
              };
              const StatusIcon = record.status === 'present' ? CheckCircle : record.status === 'late' ? Clock : record.status === 'absent' ? XCircle : AlertCircle;
              const statusColor = record.status === 'present' ? 'text-green-500' : record.status === 'late' ? 'text-orange-500' : record.status === 'absent' ? 'text-red-500' : 'text-blue-500';
              return (
                <div key={record.id} className={cn('flex items-center gap-4 p-4 rounded-xl border', statusColors[record.status as keyof typeof statusColors] || 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800')}>
                  <StatusIcon className={cn('w-5 h-5 flex-shrink-0', statusColor)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{record.courseName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      {record.checkInTime && ` • Check-in: ${record.checkInTime}`}
                      {` • ${record.method.toUpperCase()}`}
                    </p>
                  </div>
                  <span className={cn('px-2.5 py-1 rounded-lg text-xs font-medium capitalize', record.status === 'present' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : record.status === 'late' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400')}>{record.status}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import MustPageBackground from '../components/MustPageBackground';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { ChevronLeft, ChevronRight, Clock, MapPin, Download, Calendar as CalendarIcon } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const timeSlots = Array.from({ length: 12 }, (_, i) => {
  const h = i + 7;
  return `${String(h).padStart(2, '0')}:00`;
});

const courseColors = [
  'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200',
  'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200',
  'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200',
  'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200',
  'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-200',
  'bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200',
  'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200',
];

export default function TimetableScreen() {
  const { timetable } = useApp();
  const [view, setView] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);

  const now = new Date();
  const todayName = now.toLocaleDateString(undefined, { weekday: 'long' });

  const getEntriesForDay = (day: string) =>
    timetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const dailyEntries = getEntriesForDay(selectedDay);

  const getColorForCourse = (courseId: string) => {
    const idx = timetable.findIndex(t => t.courseId === courseId);
    return idx === -1 ? courseColors[0] : courseColors[idx % courseColors.length];
  };

  const getSlotSpan = (start: string, end: string) => {
    const sH = parseInt((start || '0').split(':')[0]);
    const eH = parseInt((end || '0').split(':')[0]);
    return eH - sH;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      <MustPageBackground variant="default" />
      <div className="flex items-center justify-between">
        <div>
<h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Timetable</h1>
<p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">TE Fourth Year · Semester II · 2025/2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {(['weekly', 'daily'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all', view === v ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>{v}</button>
            ))}
          </div>
          <button onClick={() => { const csv = ['Subject,Start Date,Start Time,End Time,Location,Description', ...timetable.map(t => `"${t.courseName}","${t.day}","${t.startTime}","${t.endTime}","Room ${t.room}","${t.type}"`)].join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'timetable.csv'; a.click(); URL.revokeObjectURL(url); }} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'daily' ? (
        <>
          {/* Day Selector */}
          <div className="flex items-center gap-2">
            <button onClick={() => { const idx = DAYS.indexOf(selectedDay); if (idx > 0) setSelectedDay(DAYS[idx - 1]); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex gap-1">
              {DAYS.map(d => (
                <button key={d} onClick={() => setSelectedDay(d)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', selectedDay === d ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700')}>{d.slice(0, 3)}</button>
              ))}
            </div>
            <button onClick={() => { const idx = DAYS.indexOf(selectedDay); if (idx < DAYS.length - 1) setSelectedDay(DAYS[idx + 1]); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><ChevronRight className="w-4 h-4" /></button>
          </div>

          {/* Daily Schedule */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-blue-600" />{selectedDay}</h3>
            {dailyEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No classes on {selectedDay} 🎉</div>
            ) : (
              <div className="space-y-3">
                {dailyEntries.map((entry, i) => (
                  <div key={i} className={cn('flex items-center gap-4 p-4 rounded-xl border', getColorForCourse(entry.courseId))}>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.courseName}</p>
                      <p className="text-sm opacity-75">{entry.courseCode} • {entry.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium flex items-center gap-1 justify-end"><Clock className="w-3.5 h-3.5" />{entry.startTime} - {entry.endTime}</p>
                      <p className="text-sm opacity-75 flex items-center gap-1 justify-end"><MapPin className="w-3.5 h-3.5" />Room {entry.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : timetable.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No timetable data available</p>
          <p className="text-xs text-gray-400 mt-1">Courses you're enrolled in will appear here</p>
        </div>
      ) : (
        /* Weekly Grid */
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 border-b border-gray-200 dark:border-gray-800">
              <div className="p-3 text-sm font-medium text-gray-400 border-r border-gray-200 dark:border-gray-800">Time</div>
              {DAYS.map(day => (
                <div key={day} className={cn('p-3 text-sm font-medium text-center border-r border-gray-200 dark:border-gray-800', day === todayName ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400')}>
                  {day.slice(0, 3)}
                  {day === todayName && <div className="text-[10px] font-normal text-blue-400">Today</div>}
                </div>
              ))}
            </div>
            {/* Time Grid */}
            <div className="relative">
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-6 border-b border-gray-100 dark:border-gray-800/50">
                  <div className="p-2 text-xs text-gray-400 border-r border-gray-200 dark:border-gray-800">{time}</div>
                  {DAYS.map(day => {
                    const entries = timetable.filter(t => t.day === day && t.startTime === time);
                    return (
                      <div key={day} className="relative border-r border-gray-100 dark:border-gray-800/50 min-h-[60px] p-1">
                        {entries.map(entry => (
                          <div key={entry.id} className={cn('absolute inset-x-0.5 rounded-lg border px-2 py-1 text-xs cursor-pointer hover:shadow-md transition-shadow z-10', getColorForCourse(entry.courseId))} style={{ top: 2, height: `${getSlotSpan(entry.startTime, entry.endTime) * 60 - 4}px` }}>
                            <p className="font-semibold truncate">{entry.courseCode}</p>
                            <p className="truncate opacity-75">{entry.room}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

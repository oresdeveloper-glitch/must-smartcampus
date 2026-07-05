import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import {
  Clock, MapPin, Bell, BookOpen, ClipboardList, Users,
  Calendar, TrendingUp, Upload, MessageSquare, QrCode,
  ChevronRight, Zap
} from 'lucide-react';

import MustPageBackground from '../components/MustPageBackground';

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const { user, timetable, courses, assignments, notifications } = useApp();
  const basePath = '/lecturer';

  const now = new Date();
  const todayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const todayTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const lastName = user?.name?.split(' ').slice(1).join(' ') || user?.name;

  const todayClasses = timetable
    .filter(t => t.day === todayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nextClass = todayClasses.find(t => t.startTime > todayTime) || todayClasses[0];
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const myCourses = courses.filter(c => c.lecturerId === user?.id || c.lecturerName === user?.name);

  return (
    <div className="max-w-6xl mx-auto space-y-6 page-enter-stagger relative">
      {/* Campus Background */}
      <MustPageBackground variant="home" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--must-gold)] uppercase tracking-wider">{greeting}</p>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            Dr. {lastName} 👩‍🏫
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{todayName} · {todayClasses.length} lecture{todayClasses.length !== 1 ? 's' : ''} today</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`${basePath}/notifications`)} className="relative p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />}
          </button>
        </div>
      </div>

      {/* Next Lecture Card */}
      {nextClass && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2440] to-[#1a3a5c] p-5 lg:p-6 shadow-xl shadow-[#0a1628]/20">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[var(--must-gold)]/8 blur-2xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Clock className="w-7 h-7 text-[var(--must-gold)]" />
              </div>
              <div>
                <p className="text-blue-200/70 text-xs font-medium uppercase tracking-wider">Upcoming Lecture</p>
                <h3 className="text-xl font-bold text-white">{nextClass.courseName}</h3>
                <p className="text-sm text-blue-200/60">{nextClass.courseCode}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-blue-200/80">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{nextClass.startTime} – {nextClass.endTime}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Room {nextClass.room}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />32 students</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`${basePath}/attendance`)} className="px-4 py-2.5 rounded-xl bg-[var(--must-gold)] text-[#0a1628] text-sm font-bold hover:bg-[var(--must-gold-light)] transition-all flex items-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-[var(--must-gold)]/30">
                <QrCode className="w-4 h-4" /> Take Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: "Today's Lectures", value: todayClasses.length, color: '#c8962e' },
          { icon: BookOpen, label: 'My Courses', value: myCourses.length, color: '#3b82f6' },
          { icon: ClipboardList, label: 'Pending Grades', value: assignments.filter(a => a.submitted && !a.grade).length, color: '#8b5cf6' },
          { icon: TrendingUp, label: 'Avg Attendance', value: '89%', color: '#10b981' },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-2 premium-card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--must-gold)]" />Today's Teaching Schedule
          </h3>
          {todayClasses.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No lectures today 🎉</div>
          ) : (
            <div className="space-y-2.5">
              {todayClasses.map((cls, i) => {
                const isPast = cls.endTime < todayTime;
                const isCurrent = cls.startTime <= todayTime && cls.endTime >= todayTime;
                return (
                  <div key={i} className={cn('flex items-center gap-4 p-3.5 rounded-xl border', isCurrent ? 'bg-[var(--must-gold)]/5 border-[var(--must-gold)]/30' : isPast ? 'bg-slate-50 dark:bg-slate-800/30 opacity-60' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800')}>
                    <div className={cn('w-1.5 h-10 rounded-full', isCurrent ? 'bg-[var(--must-gold)]' : isPast ? 'bg-slate-300' : 'bg-green-500')} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{cls.courseName} <span className="text-slate-400">({cls.courseCode})</span></p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cls.startTime} – {cls.endTime} · Room {cls.room} · {cls.type}</p>
                    </div>
                    {isCurrent && <span className="px-2 py-0.5 rounded-full bg-[var(--must-gold)] text-[#0a1628] text-[10px] font-bold animate-pulse">NOW</span>}
                    <button onClick={() => navigate(`${basePath}/attendance`)} className="px-3 py-1.5 rounded-lg bg-[#0a1628]/5 dark:bg-white/5 text-[#0a1628] dark:text-white text-xs font-semibold hover:bg-[#0a1628]/10 transition-colors">Attendance</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions + Courses */}
        <div className="space-y-4">
          <div className="premium-card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--must-gold)]" />Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { icon: Upload, label: 'Upload Notes', path: `${basePath}/notes?upload=true`, color: '#3b82f6' },
                { icon: ClipboardList, label: 'Create Assignment', path: `${basePath}/assignments`, color: '#f59e0b' },
                { icon: MessageSquare, label: 'Message Students', path: `${basePath}/chat`, color: '#10b981' },
                { icon: QrCode, label: 'QR Attendance', path: `${basePath}/attendance`, color: '#8b5cf6' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-sm font-medium group">
                  <a.icon className="w-4 h-4" style={{ color: a.color }} />
                  <span className="text-slate-700 dark:text-slate-300">{a.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          <div className="premium-card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--must-gold)]" />My Courses
            </h3>
            <div className="space-y-2">
              {myCourses.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No courses assigned yet</p>
                </div>
              ) : myCourses.map(c => (
                <button key={c.id} onClick={() => navigate(`${basePath}/timetable`)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--must-gold)]/10 text-[var(--must-gold)] text-xs font-bold">{c.code}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400">{(c.students?.length || 0)} students</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

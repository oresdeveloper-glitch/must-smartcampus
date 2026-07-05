import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import {
  Clock, MapPin, Bell, BookOpen, ClipboardList, MessageSquare,
  Calendar, TrendingUp, AlertTriangle, Timer, Sparkles,
  ChevronRight, Zap, QrCode, Star, Users
} from 'lucide-react';
import MustPageBackground from '../components/MustPageBackground';



export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, timetable, announcements, assignments, attendanceRecords, notifications, addNotification } = useApp();
  const basePath = '/student';

  const now = new Date();
  const todayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const todayTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const todayClasses = timetable
    .filter(t => t.day === todayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nextClass = todayClasses.find(t => t.startTime > todayTime) || todayClasses[0];
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const pendingAssignments = assignments.filter(a => !a.submitted);
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    if (!reminderSet) return;
    const timer = setTimeout(() => setReminderSet(false), 3000);
    return () => clearTimeout(timer);
  }, [reminderSet]);

  // Countdown calculation
  const getCountdown = () => {
    if (!nextClass) return null;
    const [h, m] = (nextClass.startTime || '0:0').split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return 'Now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };
  const countdown = getCountdown();

  return (
    <div className="max-w-6xl mx-auto space-y-6 page-enter-stagger relative">
      {/* Campus Background */}
      <MustPageBackground variant="home" />
      {/* ─── Welcome Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--must-gold)] uppercase tracking-wider">{greeting}</p>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            {firstName} <span className="inline-block animate-[float_2s_ease-in-out_infinite]">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{todayName} · Let's make it productive</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`${basePath}/notifications`)} className="relative p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />}
          </button>
          <button onClick={() => navigate(`${basePath}/emergency`)} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
            <AlertTriangle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* ─── Next Class — Premium Countdown Card ─── */}
      {nextClass && (
        <div className="relative overflow-hidden rounded-2xl must-shield-bg p-5 lg:p-6 shadow-xl shadow-[#0a1628]/20">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[var(--must-gold)]/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-blue-400/5 blur-2xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Countdown Ring */}
              <div className="relative flex-shrink-0">
                <svg className="w-[72px] h-[72px] -rotate-90">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                  <circle cx="36" cy="36" r="30" fill="none" stroke="var(--must-gold)" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray="188.5"
                    strokeDashoffset={countdown === 'Now' ? '0' : '47'}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Timer className="w-5 h-5 text-[var(--must-gold)] mb-0.5" />
                  <span className="text-xs font-bold text-white leading-none">{countdown}</span>
                </div>
              </div>

              <div>
                <p className="text-blue-200/70 text-xs font-medium uppercase tracking-wider">Next Class</p>
                <h3 className="text-xl font-bold text-white mt-0.5">{nextClass.courseName}</h3>
                <p className="text-sm text-blue-200/60 mt-0.5">{nextClass.courseCode}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-blue-200/80">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{nextClass.startTime} – {nextClass.endTime}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Room {nextClass.room}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{nextClass.lecturerName}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => navigate(`${basePath}/timetable`)} className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all hover:-translate-y-0.5">
                View All
              </button>
              <button onClick={() => { if (!reminderSet && nextClass) { addNotification({ title: `Reminder: ${nextClass.courseName}`, message: `${nextClass.courseName} (${nextClass.courseCode}) starts at ${nextClass.startTime} in Room ${nextClass.room}.`, type: 'reminder', courseId: nextClass.courseId, actionable: true }); setReminderSet(true); } }} className={cn('px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-lg', reminderSet ? 'bg-green-400 text-green-900 shadow-green-400/30' : 'bg-[var(--must-gold)] text-[#0a1628] hover:bg-[var(--must-gold-light)] shadow-[var(--must-gold)]/30')}>
                {reminderSet ? '✓ Reminder Set' : 'Set Reminder'}
              </button>
            </div>
          </div>

          {/* Smart Alert */}
          <div className="relative mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-blue-100/80 text-sm">
            <Sparkles className="w-4 h-4 text-[var(--must-gold)] flex-shrink-0" />
            <span><strong className="text-white">AI Suggestion:</strong> Leave in 10 minutes to arrive on time. ~12 min walk from campus gate.</span>
          </div>
        </div>
      )}

      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: "Today's Classes", value: todayClasses.length, color: '#3b82f6' },
          { icon: ClipboardList, label: 'Pending Tasks', value: pendingAssignments.length, color: '#f59e0b' },
          { icon: TrendingUp, label: 'Attendance', value: `${attendanceRate}%`, color: '#10b981' },
          { icon: Star, label: 'Streak', value: '7 days', color: '#c8962e' },
        ].map((stat, i) => {
          const paths = [`${basePath}/timetable`, `${basePath}/assignments`, `${basePath}/attendance`, `${basePath}/analytics`];
          return (
          <button key={i} onClick={() => navigate(paths[i])} className="premium-card p-4 group cursor-pointer text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
            <div className="mt-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${i === 2 ? attendanceRate : i === 3 ? 70 : 60 + i * 10}%`, backgroundColor: stat.color }} />
            </div>
          </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─── Today's Schedule ─── */}
        <div className="lg:col-span-2 premium-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--must-gold)]" />
              Today's Schedule
            </h3>
            <button onClick={() => navigate(`${basePath}/timetable`)} className="text-xs font-semibold text-[var(--must-gold)] hover:underline flex items-center gap-1">
              Full Timetable <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {todayClasses.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No classes today 🎉</p>
              <p className="text-xs mt-1">Enjoy your free time!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayClasses.map((cls, i) => {
                const isPast = cls.endTime < todayTime;
                const isCurrent = cls.startTime <= todayTime && cls.endTime >= todayTime;
                return (
                  <div key={i} className={cn(
                    'flex items-center gap-4 p-3.5 rounded-xl border transition-all group hover:shadow-sm',
                    isCurrent ? 'bg-[var(--must-gold)]/5 border-[var(--must-gold)]/30' :
                    isPast ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60' :
                    'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  )}>
                    <div className={cn(
                      'w-1.5 h-10 rounded-full flex-shrink-0',
                      isCurrent ? 'bg-[var(--must-gold)]' : isPast ? 'bg-slate-300' : 'bg-green-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('font-semibold text-sm', isPast ? 'text-slate-400' : 'text-slate-900 dark:text-white')}>{cls.courseName}</p>
                        {isCurrent && <span className="px-2 py-0.5 rounded-full bg-[var(--must-gold)] text-[#0a1628] text-[10px] font-bold animate-pulse">NOW</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cls.startTime} – {cls.endTime} · Room {cls.room} · {cls.type}</p>
                    </div>
                    {isCurrent && (
                      <button onClick={() => navigate(`${basePath}/attendance`)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--must-gold)] text-[#0a1628] text-xs font-bold hover:bg-[var(--must-gold-light)] transition-colors">
                        <QrCode className="w-3 h-3" /> Check In
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="premium-card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--must-gold)]" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: BookOpen, label: 'Notes', path: `${basePath}/notes`, bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
                { icon: ClipboardList, label: 'Assignments', path: `${basePath}/assignments`, bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
                { icon: MessageSquare, label: 'Chats', path: `${basePath}/chat`, bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
                { icon: TrendingUp, label: 'Analytics', path: `${basePath}/analytics`, bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)} className={cn('flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all group', action.bg)}>
                  <action.icon className={cn('w-5 h-5', action.text)} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="premium-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--must-gold)]" />
                Announcements
              </h3>
              <button onClick={() => navigate(`${basePath}/notifications`)} className="text-xs font-semibold text-[var(--must-gold)] hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {announcements.slice(0, 3).map(a => (
                <div key={a.id} onClick={() => navigate(`${basePath}/notifications`)} className="flex gap-3 group cursor-pointer">
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                    a.type === 'emergency' ? 'bg-red-500' : a.type === 'class-change' ? 'bg-orange-500' : 'bg-blue-500'
                  )} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[var(--must-gold)] transition-colors">{a.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

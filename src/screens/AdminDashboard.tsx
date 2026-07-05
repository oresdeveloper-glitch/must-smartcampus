import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Users, BookOpen, Calendar, Activity,
  Bell, GraduationCap, AlertTriangle, BarChart3, Settings,
  UserPlus, TrendingUp, Shield, Zap
} from 'lucide-react';

import MustPageBackground from '../components/MustPageBackground';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { analytics, notifications } = useApp();
  const basePath = '/admin';
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl mx-auto space-y-6 page-enter-stagger relative">
      {/* Campus Background */}
      <MustPageBackground variant="home" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--must-gold)] uppercase tracking-wider">{greeting}, Administrator</p>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
            MUST Admin Console 🛡️
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">System overview & university management</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`${basePath}/notifications`)} className="relative p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />}
          </button>
          <button onClick={() => navigate(`${basePath}/settings`)} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Total Students', value: analytics.totalStudents.toLocaleString(), color: '#3b82f6', trend: '+12%' },
          { icon: GraduationCap, label: 'Total Lecturers', value: analytics.totalLecturers, color: '#c8962e', trend: '+5%' },
          { icon: BookOpen, label: 'Active Courses', value: analytics.totalCourses, color: '#10b981', trend: '+3 this sem' },
          { icon: Activity, label: 'Active Users', value: analytics.activeUsers.toLocaleString(), color: '#8b5cf6', trend: `${Math.round(analytics.engagementScore)}% eng.` },
        ].map((stat, i) => (
          <button key={i} onClick={() => navigate(`${basePath}/analytics`)} className="premium-card p-4 group cursor-pointer text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
            <p className="text-xs font-medium mt-0.5" style={{ color: stat.color }}>{stat.trend}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <div className="lg:col-span-2 premium-card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--must-gold)]" />Weekly Attendance Trend
          </h3>
          <div className="space-y-4">
            {analytics.weeklyTrend.map((day, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{day.day}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{day.attendance}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--must-gold)] to-[var(--must-gold-light)] transition-all duration-700" style={{ width: `${day.attendance}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-red-400">{day.lateness}% late</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management Actions */}
        <div className="space-y-4">
          <div className="premium-card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--must-gold)]" />Management Actions
            </h3>
            <div className="space-y-2">
              {[
                { icon: UserPlus, label: 'Add New User', path: `${basePath}/users`, color: '#3b82f6' },
                { icon: BookOpen, label: 'Manage Courses', path: `${basePath}/courses`, color: '#c8962e' },
                { icon: Calendar, label: 'Upload Timetable', path: `${basePath}/timetable`, color: '#10b981' },
                { icon: Bell, label: 'Send Announcement', path: `${basePath}/notifications`, color: '#8b5cf6' },
                { icon: BarChart3, label: 'View Reports', path: `${basePath}/analytics`, color: '#ef4444' },
                { icon: AlertTriangle, label: 'Emergency Alert', path: `${basePath}/emergency`, color: '#f59e0b' },
              ].map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-sm font-medium">
                  <a.icon className="w-4 h-4" style={{ color: a.color }} />
                  <span className="text-slate-700 dark:text-slate-300">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="premium-card p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--must-gold)]" />System Status
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Authentication Service', status: 'Operational', color: '#10b981' },
                { label: 'Database Cluster', status: 'Operational', color: '#10b981' },
                { label: 'Push Notifications', status: 'Operational', color: '#10b981' },
                { label: 'File Storage', status: 'Degraded', color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-medium text-slate-500">{item.status}</span>
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

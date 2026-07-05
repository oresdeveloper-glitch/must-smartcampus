import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import MustPageBackground from '../components/MustPageBackground';
import { cn } from '../utils/cn';
import { Mail, Phone, BookOpen, Building2, Shield, Calendar, Camera, Award, Star, Zap, Trophy, Edit3, Save, X } from 'lucide-react';

export default function ProfileScreen() {
  const { user, badges, attendanceRecords, updateUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDept, setEditDept] = useState(user?.department || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const earnedBadges = badges.filter(b => b.earned);
  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const totalRecords = attendanceRecords.length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-enter-stagger relative">
      <MustPageBackground variant="default" />
      {/* Profile Header */}
      <div className="premium-card p-6 text-center">
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-full must-shield-bg flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-[#0a1628]/20 ring-4 ring-[var(--must-gold)]/20 overflow-hidden">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (user?.name?.charAt(0) || 'U')}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => { if (ev.target?.result) updateUser({ avatar: ev.target.result as string }); }; reader.readAsDataURL(file); } }} />
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[var(--must-gold)] text-[#0a1628] hover:bg-[var(--must-gold-light)] transition-colors shadow-lg">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">{user?.name || 'User'}</h2>
        <span className={cn('inline-block px-3 py-1 rounded-full text-xs font-bold capitalize mt-2', user?.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : user?.role === 'lecturer' ? 'bg-[var(--must-gold)]/10 text-[var(--must-gold)]' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400')}>{user?.role}</span>
        {editing ? (
          <div className="mt-3 flex items-center gap-2 justify-center">
            <button onClick={() => { updateUser({ name: editName || user?.name, phone: editPhone || undefined, department: editDept || undefined }); setEditing(false); }} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"><Save className="w-3.5 h-3.5" /> Save</button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold"><X className="w-3.5 h-3.5" /> Cancel</button>
          </div>
        ) : (
          <button onClick={() => { setEditName(user?.name || ''); setEditPhone(user?.phone || ''); setEditDept(user?.department || ''); setEditing(true); }} className="mt-3 flex items-center gap-1.5 mx-auto text-sm font-semibold text-[var(--must-gold)] hover:underline">
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        )}
      </div>

      {/* Info */}
      <div className="premium-card overflow-hidden">
        <h3 className="px-5 pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Information</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
            { icon: Mail, label: 'Email', value: user?.email || '—', editKey: null },
            { icon: Phone, label: 'Phone', value: user?.phone || '—', editKey: 'phone' as const },
            { icon: BookOpen, label: 'Department', value: user?.department || '—', editKey: 'dept' as const },
            { icon: Building2, label: 'Faculty', value: user?.faculty || '—', editKey: null },
            { icon: Shield, label: 'ID', value: user?.studentId || user?.staffId || '—', editKey: null },
            { icon: Calendar, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—', editKey: null },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <item.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">{item.label}</p>
                {editing && item.editKey === 'phone' ? (
                  <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="text-sm font-semibold text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-600 outline-none w-full" />
                ) : editing && item.editKey === 'dept' ? (
                  <input type="text" value={editDept} onChange={e => setEditDept(e.target.value)} className="text-sm font-semibold text-slate-900 dark:text-white bg-transparent border-b border-slate-300 dark:border-slate-600 outline-none w-full" />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Star, label: 'Attendance', value: `${attendanceRate}%`, color: '#10b981' },
          { icon: Award, label: 'Badges', value: earnedBadges.length, color: '#c8962e' },
          { icon: Zap, label: 'Streak', value: '7 days', color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-4 text-center">
            <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-[11px] font-medium text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="premium-card p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[var(--must-gold)]" />Earned Badges
          </h3>
          <div className="flex gap-3 flex-wrap">
            {earnedBadges.map(badge => (
              <div key={badge.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--must-gold)]/5 border border-[var(--must-gold)]/20">
                <span className="text-xl">{badge.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{badge.name}</p>
                  <p className="text-xs text-slate-500">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

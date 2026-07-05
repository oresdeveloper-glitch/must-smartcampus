import { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import {
  CalendarPlus, Clock, MapPin, Search,
  CheckCircle, XCircle, ChevronDown, X, CalendarDays, User, FileText
} from 'lucide-react';
import type { Appointment } from '../types';
import MustPageBackground from '../components/MustPageBackground';

type Tab = 'all' | 'upcoming' | 'pending' | 'completed';

const APPT_TYPES = [
  { id: 'consultation', label: 'Consultation', icon: '💡' },
  { id: 'project_review', label: 'Project Review', icon: '📋' },
  { id: 'academic_advising', label: 'Academic Advising', icon: '🎓' },
  { id: 'other', label: 'Other', icon: '📅' },
] as const;

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
];

export default function AppointmentScreen() {
  const { user, courses } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [formLecturer, setFormLecturer] = useState('');
  const [formType, setFormType] = useState<string>('consultation');
  const [formDate, setFormDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [formTime, setFormTime] = useState('09:00');
  const [formReason, setFormReason] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const lecturerOptions = useMemo(() => {
    const names = new Set<string>();
    courses.forEach(c => { if (c.lecturerName) names.add(c.lecturerName); });
    return Array.from(names).sort();
  }, [courses]);

  const handleBook = () => {
    const errs: Record<string, string> = {};
    if (!formLecturer.trim()) errs.lecturer = 'Lecturer is required';
    if (!formDate) errs.date = 'Date is required';
    if (!formTime) errs.time = 'Time is required';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const typeLabel = APPT_TYPES.find(t => t.id === formType)?.label || 'Consultation';
    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      title: typeLabel,
      description: formReason.trim() || `${typeLabel} requested via student portal.`,
      studentId: user?.id || '',
      studentName: user?.name || '',
      lecturerId: formLecturer.trim(),
      lecturerName: formLecturer.trim(),
      date: new Date(formDate + 'T' + formTime),
      startTime: formTime,
      endTime: String(parseInt(formTime.split(':')[0]) + 1).padStart(2, '0') + ':00',
      location: 'Lecturer Office',
      status: 'pending',
      type: formType as Appointment['type'],
      createdAt: new Date(),
    };
    setAppointments(prev => [newAppt, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormLecturer('');
    setFormType('consultation');
    setFormDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setFormTime('09:00');
    setFormReason('');
    setFormErrors({});
  };

  const updateStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, updatedAt: new Date() } : a));
    setOpenMenuId(null);
  };

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      if (tab === 'upcoming') return a.status === 'confirmed' && new Date(a.date) > new Date();
      if (tab === 'pending') return a.status === 'pending';
      if (tab === 'completed') return a.status === 'completed';
      return true;
    }).filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.lecturerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, tab, searchQuery]);

  const counts = useMemo(() => ({
    upcoming: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    total: appointments.length,
  }), [appointments]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <MustPageBackground variant="default" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Schedule and manage meetings with your lecturers</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-[#075E54] text-white rounded-xl font-semibold text-sm hover:bg-[#054d44] transition-all shadow-lg">
          <CalendarPlus className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Upcoming', value: counts.upcoming, color: 'bg-emerald-500' },
          { label: 'Pending', value: counts.pending, color: 'bg-amber-500' },
          { label: 'Completed', value: counts.completed, color: 'bg-blue-500' },
          { label: 'Total', value: counts.total, color: 'bg-slate-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title or lecturer..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30"
          />
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(['all', 'upcoming', 'pending', 'completed'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn('px-3.5 py-1.5 rounded-md text-xs font-medium capitalize transition-all', tab === t ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No appointments found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Book your first appointment to get started</p>
          </div>
        ) : (
          filtered.map(apt => (
            <div key={apt.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-start gap-4">
                {/* Date badge */}
                <div className="flex-shrink-0 w-14 text-center">
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="bg-[#075E54] dark:bg-[#0b3d36] py-1">
                      <p className="text-[10px] font-bold text-white uppercase">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}</p>
                    </div>
                    <div className="py-1.5 bg-white dark:bg-slate-800">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{new Date(apt.date).getDate()}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{APPT_TYPES.find(t => t.id === apt.type)?.icon || '📅'}</span>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{apt.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" /> {apt.lecturerName}
                      </p>
                    </div>
                    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize border', statusColor(apt.status))}>
                      {apt.status}
                    </span>
                  </div>

                  {apt.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{apt.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.startTime} – {apt.endTime}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{apt.location}</span>
                  </div>
                </div>

                {/* Actions — only the assigned lecturer can confirm/cancel */}
                {user?.role === 'lecturer' && user.name === apt.lecturerName && (
                  <div className="relative flex-shrink-0">
                    <button onClick={() => setOpenMenuId(openMenuId === apt.id ? null : apt.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {openMenuId === apt.id && (
                      <div ref={menuRef} className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        {apt.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(apt.id, 'confirmed')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left">
                              <CheckCircle className="w-4 h-4 text-emerald-500" /> Confirm
                            </button>
                            <button onClick={() => updateStatus(apt.id, 'cancelled')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">
                              <XCircle className="w-4 h-4" /> Cancel
                            </button>
                          </>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button onClick={() => { const note = window.prompt('Add or edit note:', apt.notes || ''); if (note !== null) setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, notes: note || undefined } : a)); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left">
                            <FileText className="w-4 h-4 text-slate-400" /> {apt.notes ? 'Edit note' : 'Add note'}
                          </button>
                        )}
                        {apt.status === 'completed' && (
                          <button onClick={() => updateStatus(apt.id, 'cancelled')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">
                            <XCircle className="w-4 h-4" /> Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {apt.notes && (
                <div className="mt-2.5 ml-[72px] text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-1.5 border border-slate-100 dark:border-slate-800">
                  "{apt.notes}"
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Booking Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Book Appointment</h2>
                <p className="text-sm text-slate-500 mt-0.5">Schedule a meeting with your lecturer</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Lecturer */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Lecturer</label>
                {lecturerOptions.length > 0 ? (
                  <select value={formLecturer} onChange={e => { setFormLecturer(e.target.value); setFormErrors(p => { const n = { ...p }; delete n.lecturer; return n; }); }} className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800', formErrors.lecturer ? 'border-red-400' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#075E54]/30')}>
                    <option value="">Select a lecturer...</option>
                    {lecturerOptions.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formLecturer}
                    onChange={e => setFormLecturer(e.target.value)}
                    placeholder="Enter lecturer name"
                    className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800', formErrors.lecturer ? 'border-red-400' : 'border-slate-300 dark:border-slate-700')}
                  />
                )}
                {formErrors.lecturer && <p className="text-xs text-red-500 mt-1">{formErrors.lecturer}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Appointment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {APPT_TYPES.map(t => (
                    <button key={t.id} onClick={() => setFormType(t.id)} className={cn('p-3 rounded-lg border text-left transition-colors', formType === t.id ? 'border-[#075E54] bg-[#075E54]/5 dark:bg-[#075E54]/10' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800')}>
                      <span className="text-lg">{t.icon}</span>
                      <p className={cn('text-xs font-medium mt-1', formType === t.id ? 'text-[#075E54]' : 'text-slate-600 dark:text-slate-400')}>{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800', formErrors.date ? 'border-red-400' : 'border-slate-300 dark:border-slate-700')} />
                  {formErrors.date && <p className="text-xs text-red-500 mt-1">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Time</label>
                  <select value={formTime} onChange={e => setFormTime(e.target.value)} className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800', formErrors.time ? 'border-red-400' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#075E54]/30')}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {formErrors.time && <p className="text-xs text-red-500 mt-1">{formErrors.time}</p>}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reason / Notes</label>
                <textarea
                  value={formReason}
                  onChange={e => setFormReason(e.target.value)}
                  placeholder="Briefly describe the purpose of this appointment..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30 bg-white dark:bg-slate-800 resize-none"
                />
              </div>
            </div>

            <div className="px-6 pb-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleBook} className="flex-1 py-2.5 rounded-lg bg-[#075E54] text-white font-semibold text-sm hover:bg-[#054d44] transition-colors shadow-sm">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'pending': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'completed': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'cancelled': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400';
  }
}

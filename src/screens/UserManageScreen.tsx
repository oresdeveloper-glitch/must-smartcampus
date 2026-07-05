import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { Search, UserPlus, Pencil, Trash2, X, Check, Users, Shield, GraduationCap, BookOpen } from 'lucide-react';
import type { UserRole, User } from '../types';

const STORAGE_KEY = 'smartlecture_managed_users';
const AVATAR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-pink-500', 'bg-purple-500', 'bg-teal-500'];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw).map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) }));
  } catch {}
  return [
    { id: 'user-seed-1', name: 'Anna Mwaka', email: 'anna@must.ac.tz', role: 'student', department: 'Telecommunication Engineering', studentId: 'STU-2024-001', createdAt: new Date(), verified: true },
    { id: 'user-seed-2', name: 'John Paulo', email: 'john@must.ac.tz', role: 'student', department: 'Telecommunication Engineering', studentId: 'STU-2024-002', createdAt: new Date(), verified: true },
    { id: 'user-seed-3', name: 'Dr. Mwambene', email: 'mwambene@must.ac.tz', role: 'lecturer', department: 'Telecommunication Engineering', staffId: 'LEC-001', createdAt: new Date(), verified: true },
    { id: 'user-seed-4', name: 'Prof. Kalinga', email: 'kalinga@must.ac.tz', role: 'lecturer', department: 'Telecommunication Engineering', staffId: 'LEC-002', createdAt: new Date(), verified: true },
    { id: 'user-seed-5', name: 'Dr. Nyambo', email: 'nyambo@must.ac.tz', role: 'lecturer', department: 'Telecommunication Engineering', staffId: 'LEC-003', createdAt: new Date(), verified: true },
    { id: 'user-seed-6', name: 'Admin MUST', email: 'admin@must.ac.tz', role: 'admin', department: 'Administration', staffId: 'ADM-001', createdAt: new Date(), verified: true },
  ];
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function generateId() { return `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

const ROLE_STYLES: Record<UserRole, { icon: any; color: string; label: string }> = {
  student: { icon: GraduationCap, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', label: 'Student' },
  lecturer: { icon: BookOpen, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', label: 'Lecturer' },
  admin: { icon: Shield, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', label: 'Admin' },
};

export default function UserManageScreen() {
  const { user: currentUser } = useApp();
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student' as UserRole, department: '', studentId: '', staffId: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.studentId || '').toLowerCase().includes(q) ||
      (u.staffId || '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const stats = useMemo(() => ({
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    lecturers: users.filter(u => u.role === 'lecturer').length,
    admins: users.filter(u => u.role === 'admin').length,
  }), [users]);

  function openAddForm() {
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'student', department: '', studentId: '', staffId: '' });
    setFormErrors({});
    setShowForm(true);
  }

  function openEditForm(u: User) {
    setEditingId(u.id);
    setFormData({ name: u.name, email: u.email, role: u.role, department: u.department || '', studentId: u.studentId || '', staffId: u.staffId || '' });
    setFormErrors({});
    setShowForm(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!formData.email.includes('@')) errs.email = 'Invalid email';
    if (!formData.department.trim()) errs.department = 'Department is required';
    if (editingId && confirmDelete) setConfirmDelete(null);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editingId) {
      const updated = users.map(u => u.id === editingId ? {
        ...u,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        department: formData.department.trim(),
        studentId: formData.role === 'student' ? formData.studentId.trim() || `STU-${Date.now()}` : undefined,
        staffId: formData.role !== 'student' ? formData.staffId.trim() || `STF-${Date.now()}` : undefined,
      } : u);
      setUsers(updated);
      saveUsers(updated);
    } else {
      const newUser: User = {
        id: generateId(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        avatar: '',
        department: formData.department.trim(),
        faculty: 'Pending',
        studentId: formData.role === 'student' ? formData.studentId.trim() || `STU-${Date.now()}` : undefined,
        staffId: formData.role !== 'student' ? formData.staffId.trim() || `STF-${Date.now()}` : undefined,
        createdAt: new Date(),
        verified: true,
      };
      const updated = [newUser, ...users];
      setUsers(updated);
      saveUsers(updated);
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    if (id === currentUser?.id) return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
    setConfirmDelete(null);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{users.length} registered users</p>
        </div>
        <button onClick={openAddForm} className="flex items-center gap-2 px-5 py-2.5 bg-[#075E54] text-white rounded-xl font-semibold text-sm hover:bg-[#054d44] transition-all shadow-lg">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-500' },
          { label: 'Students', value: stats.students, color: 'bg-blue-500' },
          { label: 'Lecturers', value: stats.lecturers, color: 'bg-emerald-500' },
          { label: 'Admins', value: stats.admins, color: 'bg-purple-500' },
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, ID or department..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30"
        />
      </div>

      {/* User List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">{searchQuery ? 'No users match your search' : 'No users yet'}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add your first user to get started</p>
          </div>
        ) : (
          filtered.map(u => {
            const roleStyle = ROLE_STYLES[u.role];
            const RoleIcon = roleStyle.icon;
            const isCurrent = u.id === currentUser?.id;
            return (
              <div key={u.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0', avatarColor(u.name))}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{u.name}</p>
                      {isCurrent && <span className="text-[10px] bg-[#075E54] text-white px-1.5 py-0.5 rounded-full font-medium">You</span>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', roleStyle.color)}>
                        <RoleIcon className="w-3 h-3" /> {roleStyle.label}
                      </span>
                      {u.department && <span className="text-[10px] text-slate-400">{u.department}</span>}
                      {(u.studentId || u.staffId) && (
                        <span className="text-[10px] text-slate-400">{u.studentId || u.staffId}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEditForm(u)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {!isCurrent && (
                      <button onClick={() => handleDelete(u.id)} className={cn('p-2 rounded-lg transition-colors', confirmDelete === u.id ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400')} title={confirmDelete === u.id ? 'Click again to confirm' : 'Delete'}>
                        {confirmDelete === u.id ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? 'Edit User' : 'Add New User'}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{editingId ? 'Update user information' : 'Create a new university account'}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); setFormErrors(f => { const n = { ...f }; delete n.name; return n; }); }} className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800', formErrors.name ? 'border-red-400' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#075E54]/30')} placeholder="e.g. John Doe" />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setFormErrors(f => { const n = { ...f }; delete n.email; return n; }); }} className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800', formErrors.email ? 'border-red-400' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#075E54]/30')} placeholder="e.g. john@must.ac.tz" />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value as UserRole }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30 bg-white dark:bg-slate-800">
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <input type="text" value={formData.department} onChange={e => { setFormData(p => ({ ...p, department: e.target.value })); setFormErrors(f => { const n = { ...f }; delete n.department; return n; }); }} className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800', formErrors.department ? 'border-red-400' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#075E54]/30')} placeholder="e.g. Telecommunication Eng." />
                  {formErrors.department && <p className="text-xs text-red-500 mt-1">{formErrors.department}</p>}
                </div>
                {formData.role === 'student' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Student ID</label>
                    <input type="text" value={formData.studentId} onChange={e => setFormData(p => ({ ...p, studentId: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30 bg-white dark:bg-slate-800" placeholder="e.g. STU-2024-001 (auto-generated if empty)" />
                  </div>
                )}
                {formData.role !== 'student' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Staff ID</label>
                    <input type="text" value={formData.staffId} onChange={e => setFormData(p => ({ ...p, staffId: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30 bg-white dark:bg-slate-800" placeholder="e.g. STF-001 (auto-generated if empty)" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[#075E54] text-white font-semibold text-sm hover:bg-[#054d44] transition-colors shadow-sm">
                  {editingId ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { Search, BookOpen, Plus, Trash2, X, GraduationCap, Clock, Check } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  lecture: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  lab: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  tutorial: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  seminar: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

export default function CourseManageScreen() {
  const { courses, addCourse, deleteCourse } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState({ code: '', name: '', lecturerName: '', department: 'Telecommunication Engineering', faculty: 'Science & Technology', semester: 'II' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.lecturerName.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.code.trim()) errs.code = 'Course code is required';
    if (!form.name.trim()) errs.name = 'Course name is required';
    if (!form.lecturerName.trim()) errs.lecturerName = 'Lecturer name is required';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addCourse({
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      lecturerId: `lec-${Date.now()}`,
      lecturerName: form.lecturerName.trim(),
      department: form.department.trim(),
      faculty: form.faculty.trim(),
      semester: form.semester,
      schedule: [],
      students: [],
    });
    setShowForm(false);
    setForm({ code: '', name: '', lecturerName: '', department: 'Telecommunication Engineering', faculty: 'Science & Technology', semester: 'II' });
  }

  function handleDelete(id: string) {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    deleteCourse(id);
    setConfirmDelete(null);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Course Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{courses.length} active courses</p>
        </div>
        <button onClick={() => { setShowForm(true); setFormErrors({}); }} className="flex items-center gap-2 px-5 py-2.5 bg-[#075E54] text-white rounded-xl font-semibold text-sm hover:bg-[#054d44] transition-all shadow-lg">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Courses', value: courses.length, color: 'bg-slate-500' },
          { label: 'Lecturers', value: new Set(courses.map(c => c.lecturerName)).size, color: 'bg-emerald-500' },
          { label: 'Departments', value: new Set(courses.map(c => c.department)).size, color: 'bg-blue-500' },
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
          placeholder="Search by course code, name, lecturer..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30"
        />
      </div>

      {/* Course List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">{searchQuery ? 'No courses match your search' : 'No courses yet'}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add your first course to get started</p>
          </div>
        ) : (
          filtered.map(course => {
            return (
              <div key={course.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#075E54]/10 dark:bg-[#075E54]/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-[#075E54]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-[#075E54] text-white px-2 py-0.5 rounded">{course.code}</span>
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{course.name}</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="font-medium">{course.lecturerName}</span>
                          <span className="text-slate-300">|</span>
                          <span>{course.department}</span>
                        </p>
                      </div>
                      <button onClick={() => handleDelete(course.id)} className={cn('p-2 rounded-lg transition-colors flex-shrink-0', confirmDelete === course.id ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400')} title={confirmDelete === course.id ? 'Click again to confirm' : 'Delete'}>
                        {confirmDelete === course.id ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {course.schedule.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        {course.schedule.slice(0, 3).map((slot, i) => (
                          <span key={i} className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium', TYPE_COLORS[slot.type] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}>
                            <Clock className="w-3 h-3" /> {slot.day} {slot.startTime}-{slot.endTime}
                          </span>
                        ))}
                        {course.schedule.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{course.schedule.length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                      <span>Semester {course.semester}</span>
                      <span>{course.faculty}</span>
                      <span>{course.students?.length || 0} students</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Course</h2>
                <p className="text-sm text-slate-500 mt-0.5">Create a new course in the system</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Course Code</label>
                  <input type="text" value={form.code} onChange={e => { setForm(p => ({ ...p, code: e.target.value })); setFormErrors(f => { const n = { ...f }; delete n.code; return n; }); }} placeholder="e.g. TE416" className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800 uppercase', formErrors.code ? 'border-red-400' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#075E54]/30')} />
                  {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Semester</label>
                  <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30 bg-white dark:bg-slate-800">
                    <option value="I">Semester I</option>
                    <option value="II">Semester II</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Course Name</label>
                  <input type="text" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormErrors(f => { const n = { ...f }; delete n.name; return n; }); }} placeholder="e.g. Advanced Network Security" className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800', formErrors.name ? 'border-red-400' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#075E54]/30')} />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lecturer Name</label>
                  <input type="text" value={form.lecturerName} onChange={e => { setForm(p => ({ ...p, lecturerName: e.target.value })); setFormErrors(f => { const n = { ...f }; delete n.lecturerName; return n; }); }} placeholder="e.g. Dr. John" className={cn('w-full px-4 py-2.5 rounded-lg border text-sm outline-none bg-white dark:bg-slate-800', formErrors.lecturerName ? 'border-red-400' : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#075E54]/30')} />
                  {formErrors.lecturerName && <p className="text-xs text-red-500 mt-1">{formErrors.lecturerName}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <input type="text" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30 bg-white dark:bg-slate-800" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Faculty</label>
                  <input type="text" value={form.faculty} onChange={e => setForm(p => ({ ...p, faculty: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-[#075E54]/30 bg-white dark:bg-slate-800" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[#075E54] text-white font-semibold text-sm hover:bg-[#054d44] transition-colors shadow-sm">
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

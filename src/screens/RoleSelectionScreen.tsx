import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import { GraduationCap, Shield, Users, ArrowRight } from 'lucide-react';

export default function RoleSelectionScreen() {
  const navigate = useNavigate();
  const { switchRole, user } = useApp();

  const roles: { role: UserRole; icon: React.ElementType; title: string; desc: string; gradient: string }[] = [
    { role: 'admin', icon: Shield, title: 'Administrator', desc: 'Manage users, courses, timetables, and monitor system-wide analytics.', gradient: 'from-purple-600 to-purple-400' },
    { role: 'lecturer', icon: Users, title: 'Lecturer', desc: 'Upload notes, mark attendance, manage assignments, and communicate with students.', gradient: 'from-[#c8962e] to-[#e8c56d]' },
    { role: 'student', icon: GraduationCap, title: 'Student', desc: 'View timetable, access notes, submit assignments, and track your attendance.', gradient: 'from-[#0a1628] to-[#1a3a5c]' },
  ];

  const handleSelect = (role: UserRole) => {
    if (user) switchRole(role);
    navigate(`/${role}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--must-bg)]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl must-shield-bg mb-4 shadow-xl shadow-[#0a1628]/20">
            <GraduationCap className="w-8 h-8 text-[var(--must-gold)]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Select Your Role</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Choose how you want to use MUST SmartCampus</p>
        </div>

        <div className="space-y-3">
          {roles.map(({ role, icon: Icon, title, desc, gradient }) => (
            <button key={role} onClick={() => handleSelect(role)} className="w-full premium-card p-5 flex items-center gap-4 group text-left">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white capitalize">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[var(--must-gold)] group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

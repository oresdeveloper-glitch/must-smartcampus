import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import { cn } from '../utils/cn';

import { img } from '@/utils/cn';
const mustLogo = img('must logo.jpg');
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { signup, darkMode } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const result = await signup(name, email, password, role);
      if (result.success) navigate(`/${role}`, { replace: true });
      else setError(result.error || 'Registration failed.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('min-h-screen flex', darkMode ? 'dark' : '')}>
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--must-bg)]">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/login')} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-xl mb-4">
              <img 
                src={mustLogo} 
                alt="MUST" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Join MUST SmartCampus</p>
          </div>

          <form onSubmit={handleRegister} className="premium-card p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'lecturer', 'admin'] as UserRole[]).map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)} className={cn(
                    'py-2.5 px-3 rounded-xl text-sm font-semibold capitalize transition-all border',
                    role === r
                      ? 'bg-[#0a1628] dark:bg-[var(--must-gold)] border-[#0a1628] dark:border-[var(--must-gold)] text-white dark:text-[#0a1628] shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}>{r}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ores John Mushi" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--must-gold)]/30 focus:border-[var(--must-gold)]/50 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@must.ac.tz" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--must-gold)]/30 focus:border-[var(--must-gold)]/50 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--must-gold)]/30 focus:border-[var(--must-gold)]/50 outline-none transition-all text-sm font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--must-gold)]/30 focus:border-[var(--must-gold)]/50 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 must-shield-bg text-white rounded-xl font-bold hover:opacity-95 transition-all shadow-lg shadow-[#0a1628]/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Creating...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account? <Link to="/login" className="text-[var(--must-gold)] font-semibold hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

import { img } from '@/utils/cn';
const mustLogo = img('must logo.jpg');
const fallbackBg = img('must-pic.jpg');
const mustBuilding = fallbackBg;

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, googleLogin, darkMode } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const saved = localStorage.getItem('smartlecture_user');
        let role = 'student';
        if (saved) try { role = JSON.parse(saved).role || 'student'; } catch { role = 'student'; }
        navigate(`/${role}`, { replace: true });
      } else {
        setError(result.error || 'Login failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isGoogleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleClick = () => {
    if (!isGoogleConfigured) {
      setError('Google sign-in needs setup. Create a .env file with VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
    const redirectUri = window.location.origin + '/must-smartcampus';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&include_granted_scopes=true`;

    const gis = window.google?.accounts?.oauth2;
    if (gis?.initTokenClient) {
      const tokenClient = gis.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (response: any) => {
          if (response.access_token) {
            setLoading(true);
            setError('');
            try {
              const result = await googleLogin(response.access_token);
              if (result.success) {
                const saved = localStorage.getItem('smartlecture_user');
                let role = 'student';
                if (saved) try { role = JSON.parse(saved).role || 'student'; } catch { role = 'student'; }
                navigate(`/${role}`, { replace: true });
              } else {
                setError(result.error || 'Google sign-in failed.');
              }
            } catch {
              setError('Google sign-in failed. Please try again.');
            } finally {
              setLoading(false);
            }
          } else {
            setError('Google sign-in was cancelled.');
          }
        },
        error_callback: () => setError('Google sign-in failed. Check your client ID.'),
      });
      tokenClient.requestAccessToken();
      return;
    }

    // Fallback: open popup window
    const popup = window.open(authUrl, 'google-auth', 'width=600,height=700');
    if (!popup) { setError('Popup blocked. Allow popups for this site.'); return; }
    setLoading(true);

    const pollTimer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(pollTimer);
          setLoading(false);
          return;
        }
        const url = popup.location.href;
        if (url && url.includes('access_token=')) {
          const hash = url.split('#')[1];
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          if (accessToken) {
            clearInterval(pollTimer);
            popup.close();
            launchWithToken(accessToken, googleLogin, setLoading, setError, navigate);
          }
        }
      } catch { /* cross-origin errors during redirect */ }
    }, 300);
  };

  async function launchWithToken(
    accessToken: string,
    googleLoginFn: (token: string) => Promise<{ success: boolean; error?: string }>,
    setLoadingFn: (v: boolean) => void,
    setErrorFn: (v: string) => void,
    navigateFn: (path: string, opts?: { replace: boolean }) => void
  ) {
    setLoadingFn(true);
    setErrorFn('');
    try {
      const result = await googleLoginFn(accessToken);
      if (result.success) {
        const saved = localStorage.getItem('smartlecture_user');
        let role = 'student';
        if (saved) try { role = JSON.parse(saved).role || 'student'; } catch { role = 'student'; }
        navigateFn(`/${role}`, { replace: true });
      } else {
        setErrorFn(result.error || 'Google sign-in failed.');
      }
    } catch {
      setErrorFn('Google sign-in failed. Please try again.');
    } finally {
      setLoadingFn(false);
    }
  }

  return (
    <div className={cn('min-h-screen flex', darkMode ? 'dark' : '')}>
      {/* Left — Brand Panel with Campus Building */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-10">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${mustBuilding}")` }}
          onError={(e) => { (e.target as HTMLDivElement).style.backgroundImage = `url("${fallbackBg}")`; }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/95 via-[#0a1628]/85 to-[#1a3a5c]/75" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl">
              <img 
                src={mustLogo}
                alt="MUST Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">MUST</h2>
              <p className="text-[var(--must-gold)] text-xs font-medium tracking-wider uppercase">SmartCampus</p>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Your Digital<br />
            <span className="text-[var(--must-gold)]">Campus Experience</span>
          </h1>
          <p className="text-slate-300/80 mt-4 text-base leading-relaxed max-w-md">
            Stay ahead with smart lecture alerts, real-time timetable updates, and seamless academic collaboration — all in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex gap-3 flex-wrap">
            {['📅 Smart Timetable', '🔔 AI Reminders', '📚 Offline Notes'].map((f, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium backdrop-blur-sm">{f}</span>
            ))}
          </div>
          <p className="text-slate-400 text-xs">Mbeya University of Science & Technology © 2025</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--must-bg)]">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl mb-4">
              <img 
                src={mustLogo}
                alt="MUST Logo" 
                className="w-14 h-14 object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">MUST SmartCampus</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back to your campus</p>
          </div>

          {/* Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back 👋</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Sign in to access your MUST SmartCampus</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="premium-card p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm animate-[fadeInUp_0.3s_ease-out]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className={cn('relative transition-all duration-300', focusedField === 'email' ? 'scale-[1.01]' : '')}>
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@must.ac.tz"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--must-gold)]/30 focus:border-[var(--must-gold)]/50 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className={cn('relative transition-all duration-300', focusedField === 'password' ? 'scale-[1.01]' : '')}>
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--must-gold)]/30 focus:border-[var(--must-gold)]/50 outline-none transition-all text-sm font-medium"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                <input type="checkbox" className="rounded border-slate-300 text-[var(--must-gold)] focus:ring-[var(--must-gold)]/30" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-[var(--must-gold)] hover:text-[var(--must-gold-light)] transition-colors">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 must-shield-bg text-white rounded-xl font-semibold hover:opacity-95 transition-all shadow-lg shadow-[#0a1628]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-medium">or continue with</span></div>
            </div>

            <button type="button" onClick={handleGoogleClick} disabled={loading} className="w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              New to MUST SmartCampus?{' '}
              <Link to="/register" className="text-[var(--must-gold)] font-semibold hover:text-[var(--must-gold-light)] transition-colors">Create Account</Link>
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}

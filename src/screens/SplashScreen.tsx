import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
const mustLogo = '/images/must logo.jpg';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 30);

    const timer = setTimeout(() => {
      if (user) {
        navigate(`/${user.role}`, { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2200);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [user, navigate]);

  return (
    <div className="min-h-screen must-shield-bg flex items-center justify-center relative overflow-hidden">
      {/* Animated accent blobs */}
      <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-[var(--must-gold)]/10 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl animate-[float_10s_ease-in-out_infinite_2s]" />

      <div className="relative text-center space-y-8 animate-[fadeInScale_0.8s_ease-out]">
        {/* Official MUST Logo */}
        <div className="relative inline-flex">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl ring-4 ring-white/20">
            <img 
              src={mustLogo} 
              alt="MUST Logo" 
              className="w-28 h-28 object-contain"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[var(--must-gold)] flex items-center justify-center shadow-lg shadow-[var(--must-gold)]/40 animate-[pulse-glow_2s_ease-in-out_infinite]">
            <span className="text-[#0a1628] text-lg">🎓</span>
          </div>
        </div>

        {/* Brand Text */}
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            MUST
          </h1>
          <p className="text-[var(--must-gold)] text-sm font-semibold tracking-[0.2em] uppercase mt-1">SmartCampus</p>
          <p className="text-slate-400 text-sm mt-3 font-light max-w-xs mx-auto leading-relaxed">
            Mbeya University of Science & Technology
          </p>
          <p className="text-slate-500 text-xs mt-1 italic">"Chuo Kikuu cha Sayansi na Teknolojia Mbeya"</p>
        </div>

        {/* Progress Bar */}
        <div className="w-52 mx-auto">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--must-gold)] to-[var(--must-gold-light)] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/40 text-[10px] mt-3 font-light tracking-wide">Loading your campus experience...</p>
        </div>
      </div>
    </div>
  );
}

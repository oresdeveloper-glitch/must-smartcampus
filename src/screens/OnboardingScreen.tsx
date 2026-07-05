import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen, MessageSquare, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

import { img } from '@/utils/cn';
const mustLogo = img('must logo.jpg');

const slides = [
  {
    icon: Bell,
    title: 'Never Miss a Lecture',
    description: 'Smart AI-powered notifications remind you before every class. Get time and location-based alerts.',
    color: 'from-[#c8962e] to-[#e8c56d]',
  },
  {
    icon: BookOpen,
    title: 'All Your Notes, One Place',
    description: 'Download lecture notes, PDFs, and videos. Access them offline anytime, anywhere on campus.',
    color: 'from-[#0a1628] to-[#1a3a5c]',
  },
  {
    icon: MessageSquare,
    title: 'Stay Connected',
    description: 'Chat with lecturers and classmates. Join group discussions and collaborate on assignments.',
    color: 'from-[#10b981] to-[#34d399]',
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (current < slides.length - 1) setCurrent(c => c + 1);
    else navigate('/login');
  };
  const prev = () => { if (current > 0) setCurrent(c => c - 1); };

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <div className="pt-6 px-6 flex justify-end">
        <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Skip</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* MUST Logo at top */}
        <div className="mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
            <img 
              src={mustLogo} 
              alt="MUST" 
              className="w-14 h-14 object-contain"
            />
          </div>
        </div>

        <div className={cn('w-28 h-28 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl', `bg-gradient-to-br ${slide.color}`)} key={current}>
          <slide.icon className="w-14 h-14 text-white" />
        </div>

        <div className="text-center max-w-md" key={`t-${current}`}>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">{slide.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{slide.description}</p>
        </div>

        <div className="flex gap-2 mt-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === current ? 'w-8 bg-[var(--must-gold)]' : 'w-2 bg-slate-300 dark:bg-slate-700'
            )} />
          ))}
        </div>
      </div>

      <div className="p-6 flex items-center justify-between">
        <button onClick={prev} className={cn('p-3 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors', current === 0 && 'invisible')}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => navigate('/login')} className="text-sm font-semibold text-[var(--must-gold)] hover:underline">Sign In</button>
        <button onClick={next} className="p-3 rounded-full must-shield-bg text-white hover:opacity-90 transition-all shadow-lg shadow-[#0a1628]/20">
          {current === slides.length - 1 ? <ArrowRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

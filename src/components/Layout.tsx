import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import {
  Calendar, Bell, MessageSquare, BookOpen, ClipboardList,
  ClipboardCheck, BarChart3, Settings, AlertTriangle, LogOut,
  Moon, Sun, Menu, Search, Users, Upload, GraduationCap, QrCode,
  Home, Sparkles, CalendarPlus
} from 'lucide-react';


import { img } from '@/utils/cn';
const mustLogo = img('must logo.jpg');
import { useState, useEffect } from 'react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, darkMode, toggleDarkMode, logout, notifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const role = user?.role || 'student';
  const basePath = `/${role}`;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const studentNav: NavItem[] = [
    { icon: Home, label: 'Dashboard', path: basePath },
    { icon: Calendar, label: 'Timetable', path: `${basePath}/timetable` },
    { icon: Bell, label: 'Notifications', path: `${basePath}/notifications`, badge: unreadNotifs },
    { icon: MessageSquare, label: 'Chats', path: `${basePath}/chat` },
    { icon: CalendarPlus, label: 'Appointments', path: `${basePath}/appointments` },
    { icon: BookOpen, label: 'Notes', path: `${basePath}/notes` },
    { icon: ClipboardList, label: 'Assignments', path: `${basePath}/assignments` },
    { icon: ClipboardCheck, label: 'Attendance', path: `${basePath}/attendance` },
    { icon: BarChart3, label: 'Analytics', path: `${basePath}/analytics` },
    { icon: AlertTriangle, label: 'Emergency', path: `${basePath}/emergency` },
    { icon: Settings, label: 'Settings', path: `${basePath}/settings` },
  ];

  const lecturerNav: NavItem[] = [
    { icon: Home, label: 'Dashboard', path: basePath },
    { icon: Calendar, label: 'Timetable', path: `${basePath}/timetable` },
    { icon: Bell, label: 'Notifications', path: `${basePath}/notifications`, badge: unreadNotifs },
    { icon: MessageSquare, label: 'Chats', path: `${basePath}/chat` },
    { icon: CalendarPlus, label: 'Appointments', path: `${basePath}/appointments` },
    { icon: Upload, label: 'Upload Notes', path: `${basePath}/notes?upload=true` },
    { icon: ClipboardList, label: 'Assignments', path: `${basePath}/assignments` },
    { icon: QrCode, label: 'Attendance', path: `${basePath}/attendance` },
    { icon: BarChart3, label: 'Analytics', path: `${basePath}/analytics` },
    { icon: AlertTriangle, label: 'Emergency', path: `${basePath}/emergency` },
    { icon: Settings, label: 'Settings', path: `${basePath}/settings` },
  ];

  const adminNav: NavItem[] = [
    { icon: Home, label: 'Dashboard', path: basePath },
    { icon: Users, label: 'User Mgmt', path: `${basePath}/users` },
    { icon: Calendar, label: 'Timetable', path: `${basePath}/timetable` },
    { icon: Bell, label: 'Announcements', path: `${basePath}/notifications` },
    { icon: CalendarPlus, label: 'Appointments', path: `${basePath}/appointments` },
    { icon: GraduationCap, label: 'Courses', path: `${basePath}/courses` },
    { icon: BarChart3, label: 'Analytics', path: `${basePath}/analytics` },
    { icon: AlertTriangle, label: 'Emergency', path: `${basePath}/emergency` },
    { icon: Settings, label: 'Settings', path: `${basePath}/settings` },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'lecturer' ? lecturerNav : studentNav;

  const visibleNavItems = navItems.filter(item =>
    !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isActive = (path: string) => {
    if (path === basePath) return location.pathname === basePath;
    return location.pathname.startsWith(path);
  };

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // ─── Bottom Mobile Nav Items ───
  const bottomNavItems = navItems.slice(0, 5);

  return (
    <div className={cn('min-h-screen flex flex-col bg-[var(--must-bg)]', darkMode ? 'dark' : '')}>
      <div className="flex flex-1">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar — Premium MUST Design */}
        <aside className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-full w-[280px] flex flex-col transition-all duration-400 ease-out lg:translate-x-0',
          'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}>
          {/* MUST Brand Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  <img 
                    src={mustLogo}
                    alt="MUST" 
                    className="w-9 h-9 object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--must-gold)] flex items-center justify-center shadow">
                  <Sparkles className="w-2.5 h-2.5 text-[#0a1628]" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold tracking-tight text-[#0a1628] dark:text-white leading-none">MUST</h1>
                <p className="text-[11px] font-medium text-[var(--must-gold)] tracking-wider uppercase">SmartCampus</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize mt-0.5">{role} Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                    active
                      ? 'bg-[#0a1628]/5 dark:bg-[#c8962e]/10 text-[#0a1628] dark:text-[#e8c56d]'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--must-gold)]" />
                  )}
                  <item.icon className={cn(
                    'w-[18px] h-[18px] flex-shrink-0 transition-colors',
                    active ? 'text-[var(--must-gold)]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )} />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-[#ef4444] text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">{item.badge}</span>
                  )}
                  {active && <Sparkles className="w-3 h-3 text-[var(--must-gold)] ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Bottom — User & Sign Out */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button onClick={() => navigate(`${basePath}/profile`)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-9 h-9 rounded-full must-shield-bg flex items-center justify-center text-white text-sm font-bold ring-2 ring-[var(--must-gold)]/30">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 capitalize">{role}</p>
              </div>
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-[18px] h-[18px]" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top App Bar — Glass */}
          <header className="sticky top-0 z-30 glass border-b border-slate-200/60 dark:border-slate-800/60 px-4 lg:px-6 py-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                  <Menu className="w-5 h-5" />
                </button>
                <div className={cn(
                  'hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 text-sm',
                  searchFocused
                    ? 'bg-white dark:bg-slate-800 shadow-md ring-2 ring-[var(--must-gold)]/30'
                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400'
                )}>
                  <Search className="w-4 h-4" />
                   <input
                    type="text"
                    placeholder="Search courses, notes, chats..."
                    className="bg-transparent outline-none text-slate-700 dark:text-slate-200 w-48 lg:w-64 placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => { setSearchFocused(false); setTimeout(() => setSearchQuery(''), 200); }}
                    onKeyDown={e => { if (e.key === 'Enter' && visibleNavItems.length > 0) { setSearchQuery(''); navigate(visibleNavItems[0].path); } }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleDarkMode} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </button>
                <button onClick={() => navigate(`${basePath}/notifications`)} className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <Bell className="w-[18px] h-[18px]" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>
                <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
                <button onClick={() => navigate(`${basePath}/profile`)} className="hidden sm:flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-full must-shield-bg flex items-center justify-center text-white text-xs font-bold ring-2 ring-[var(--must-gold)]/30">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-x-hidden page-enter">
            {children}
          </main>
        </div>
      </div>

      {/* ─── Premium Bottom Navigation Bar (Mobile) ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 bottom-nav-shadow safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl min-w-[56px] transition-all duration-200 relative',
                  active ? 'text-[var(--must-gold)]' : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {active && (
                  <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-[var(--must-gold)]" />
                )}
                <div className={cn(
                  'p-1 rounded-lg transition-all duration-200',
                  active ? 'bg-[var(--must-gold)]/10' : ''
                )}>
                  <item.icon className="w-[20px] h-[20px]" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-all',
                  active ? 'font-semibold' : ''
                )}>
                  {item.label.length > 8 ? item.label.slice(0, 7) + '..' : item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

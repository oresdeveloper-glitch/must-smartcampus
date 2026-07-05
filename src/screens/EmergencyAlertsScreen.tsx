import { useState } from 'react';
import MustPageBackground from '../components/MustPageBackground';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { AlertTriangle, Bell, Siren, Megaphone, Send, Clock, X, CheckCircle, Radio } from 'lucide-react';

export default function EmergencyAlertsScreen() {
  const { user, addAnnouncement, notifications } = useApp();
  const [showCompose, setShowCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const isAdminOrLecturer = user?.role === 'admin' || user?.role === 'lecturer';
  const emergencyNotifs = notifications.filter(n => n.type === 'emergency' || n.type === 'class-change');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    addAnnouncement({
      title,
      message,
      type: 'emergency',
      targetRoles: ['student', 'lecturer'],
    });
    setTitle('');
    setMessage('');
    setShowCompose(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <MustPageBackground variant="default" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Siren className="w-6 h-6 text-red-500" />
            Emergency Alerts
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {isAdminOrLecturer ? 'Send urgent notifications to all users' : 'View emergency alerts and class changes'}
          </p>
        </div>
        {isAdminOrLecturer && (
          <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">
            <Megaphone className="w-4 h-4" /> Send Alert
          </button>
        )}
      </div>

      {/* Success Toast */}
      {sent && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm animate-[fadeIn_0.3s_ease-out]">
          <CheckCircle className="w-4 h-4" /> Alert sent successfully to all users!
        </div>
      )}

      {/* Compose Form */}
      {showCompose && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-red-200 dark:border-red-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Send Emergency Alert
            </h3>
            <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSend} className="space-y-3">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Alert title (e.g. Room Change, Class Cancelled)" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-red-500" />
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe the emergency or change in detail..." rows={4} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none" />
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <Radio className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-700 dark:text-red-400">This will notify ALL students and lecturers immediately. Push notifications + in-app alerts.</p>
            </div>
            <button type="submit" className="w-full py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Emergency Alert
            </button>
          </form>
        </div>
      )}

      {/* Emergency Info Cards */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { icon: Bell, title: 'Room Change', desc: 'Lecture moved to different room', color: 'orange' },
          { icon: AlertTriangle, title: 'Class Cancelled', desc: 'Lecture cancelled by lecturer', color: 'red' },
          { icon: Clock, title: 'Time Change', desc: 'Lecture rescheduled', color: 'blue' },
        ].map((card, i) => (
          <div key={i} className={cn(
            'rounded-2xl border p-4',
            card.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
            card.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
            'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          )}>
            <card.icon className={cn('w-8 h-8 mb-2', card.color === 'red' ? 'text-red-600' : card.color === 'orange' ? 'text-orange-600' : 'text-blue-600')} />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{card.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent Emergency Alerts */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Emergency Alerts</h3>
        {emergencyNotifs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No emergency alerts yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyNotifs.map(notif => (
              <div key={notif.id} className={cn('p-4 rounded-xl border', notif.type === 'emergency' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800')}>
                <div className="flex items-center gap-2 mb-1">
                  {notif.type === 'emergency' ? <Siren className="w-4 h-4 text-red-500" /> : <Bell className="w-4 h-4 text-orange-500" />}
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">{notif.title}</h4>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium capitalize', notif.type === 'emergency' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400')}>{notif.type}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Emergency Contacts</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Campus Security', phone: '+255 700 000 911', color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
            { label: 'Health Center', phone: '+255 700 000 912', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
            { label: 'IT Support', phone: '+255 700 000 913', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
            { label: 'Academic Office', phone: '+255 700 000 914', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
          ].map((contact, i) => (
            <div key={i} className={cn('p-3 rounded-xl border', contact.color)}>
              <p className="text-xs font-medium text-gray-900 dark:text-white">{contact.label}</p>
              <p className="text-sm font-bold mt-0.5 text-gray-700 dark:text-gray-300">{contact.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

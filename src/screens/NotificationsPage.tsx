import { useState } from 'react';
import MustPageBackground from '../components/MustPageBackground';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { Bell, BellOff, Megaphone, AlertTriangle, Clock, Info, CheckCheck, Send, X } from 'lucide-react';

const typeIcons: Record<string, { icon: any; color: string }> = {
  reminder: { icon: Clock, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  emergency: { icon: AlertTriangle, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  'class-change': { icon: Bell, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  info: { icon: Info, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  alert: { icon: Megaphone, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
};

const timeAgo = (date: Date) => {
  if (!date || isNaN(new Date(date).getTime())) return '';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, addAnnouncement, user } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeType, setComposeType] = useState<'general' | 'emergency' | 'class-change' | 'exam'>('general');

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle || !composeMessage) return;
    addAnnouncement({
      title: composeTitle,
      message: composeMessage,
      type: composeType,
      targetRoles: ['student', 'lecturer'],
    });
    setComposeTitle('');
    setComposeMessage('');
    setShowCompose(false);
  };

  const isAdminOrLecturer = user?.role === 'admin' || user?.role === 'lecturer';

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <MustPageBackground variant="default" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllNotificationsRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          {isAdminOrLecturer && (
            <button onClick={() => setShowCompose(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              <Send className="w-4 h-4" /> Send
            </button>
          )}
        </div>
      </div>

      {/* Compose Form */}
      {showCompose && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Send Announcement</h3>
            <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleCompose} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <div className="flex gap-2">
                {(['general', 'class-change', 'exam', 'emergency'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setComposeType(t)} className={cn('px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all', composeType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>{t}</button>
                ))}
              </div>
            </div>
            <input type="text" value={composeTitle} onChange={e => setComposeTitle(e.target.value)} placeholder="Announcement title" className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea value={composeMessage} onChange={e => setComposeMessage(e.target.value)} placeholder="Write your announcement..." rows={3} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">Send Announcement</button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all', filter === f ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>{f} {f === 'unread' && `(${unreadCount})`}</button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          filtered.map(notif => {
            const typeInfo = typeIcons[notif.type] || typeIcons.info;
            const Icon = typeInfo.icon;
            return (
              <button
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={cn(
                  'w-full text-left bg-white dark:bg-gray-900 rounded-xl border p-4 hover:shadow-md transition-all',
                  !notif.read ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-800'
                )}
              >
                <div className="flex gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', typeInfo.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-sm font-medium', !notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400')}>{notif.title}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

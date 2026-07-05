import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import MustPageBackground from '../components/MustPageBackground';
import { cn } from '../utils/cn';
import { TrendingUp, Users, Target, Award, Activity, Clock, BarChart3, Zap } from 'lucide-react';

export default function AnalyticsScreen() {
  const { analytics, attendanceRecords, badges, leaderboard, user } = useApp();
  const isAdmin = user?.role === 'admin';

  const attendanceRate = useMemo(() => {
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const total = attendanceRecords.length;
    return total > 0 ? Math.round((presentCount / total) * 100) : 100;
  }, [attendanceRecords]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      <MustPageBackground variant="default" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          {isAdmin ? 'System-wide analytics and reports' : 'Your academic performance overview'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(isAdmin ? [
          { Icon: Users, label: 'Total Students', value: analytics.totalStudents.toLocaleString(), color: 'bg-blue-600' },
          { Icon: Activity, label: 'Active Users', value: analytics.activeUsers.toLocaleString(), color: 'bg-green-600' },
          { Icon: TrendingUp, label: 'Attendance Rate', value: `${analytics.attendanceRate}%`, color: 'bg-purple-600' },
          { Icon: Clock, label: 'Lateness Rate', value: `${analytics.latenessRate}%`, color: 'bg-orange-600' },
        ] : [
          { Icon: TrendingUp, label: 'Attendance Rate', value: `${attendanceRate}%`, color: 'bg-green-600' },
          { Icon: Clock, label: 'On-Time Rate', value: '87%', color: 'bg-blue-600' },
          { Icon: Target, label: 'Assignments Done', value: '8/10', color: 'bg-purple-600' },
          { Icon: Activity, label: 'Engagement', value: `${analytics.engagementScore}%`, color: 'bg-orange-600' },
        ]).map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}><stat.Icon className="w-4 h-4 text-white" /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-600" />Weekly Trends</h3>
          <div className="space-y-4">
            {analytics.weeklyTrend.length === 0 ? (
              <div className="text-center py-8 text-gray-400"><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No trend data yet</p></div>
            ) : analytics.weeklyTrend.map((day, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{day.day}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{day.attendance}% attendance</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${day.attendance}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{day.lateness}% late</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard & Badges */}
        <div className="space-y-4">
          {/* Leaderboard */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" />Punctuality Leaderboard</h3>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-400"><Award className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No leaderboard data yet</p></div>
              ) : leaderboard.map(entry => (
                <div key={entry.userId} className={cn('flex items-center gap-3 p-2 rounded-lg', entry.userId === user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800')}>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : entry.rank === 2 ? 'bg-gray-100 text-gray-600' : entry.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500')}>
                    {entry.rank}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">{entry.userName.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.userName}</p>
                    <p className="text-xs text-gray-400">{entry.streak} day streak • {entry.perfectAttendance} perfect</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{entry.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" />Your Badges</h3>
            <div className="grid grid-cols-3 gap-2">
              {badges.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-gray-400"><Zap className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No badges earned yet</p></div>
              ) : badges.map(badge => (
                <div key={badge.id} className={cn('p-3 rounded-xl border text-center transition-all', badge.earned ? 'bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 shadow-sm' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-50')}>
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{badge.name}</p>
                  {badge.earned && <div className="w-full h-1 bg-yellow-400 rounded-full mt-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

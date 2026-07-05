import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function NotificationManager() {
  const { timetable, alertEnabled, voiceEnabled, notify, speak, pushEnabled, requestNotificationPermission } = useApp();
  const alertedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (pushEnabled || alertEnabled) requestNotificationPermission();
  }, [pushEnabled, alertEnabled, requestNotificationPermission]);

  useEffect(() => {
    if (!alertEnabled) return;

    const getMinutesUntil = (startTime: string) => {
      const [h, m] = startTime.split(':').map(Number);
      const now = new Date();
      const lecture = new Date();
      lecture.setHours(h, m, 0, 0);
      return (lecture.getTime() - now.getTime()) / 60000;
    };

    const checkTimetable = () => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = dayNames[new Date().getDay()];

      timetable.forEach(entry => {
        if (entry.day !== today) return;

        const minsUntil = getMinutesUntil(entry.startTime);
        const alertKey = `${entry.id}-${new Date().toDateString()}`;

        if (minsUntil > 0 && minsUntil <= 15 && !alertedRef.current.has(alertKey)) {
          alertedRef.current.add(alertKey);
          const timeStr = entry.startTime;
          notify(`Lecture starting soon: ${entry.courseCode}`, {
            body: `${entry.courseName} with ${entry.lecturerName} at ${timeStr} in ${entry.room}`,
            urgency: 'normal',
          });
          if (voiceEnabled) {
            speak(`Reminder: ${entry.courseName} with ${entry.lecturerName} starts at ${timeStr} in ${entry.room}`);
          }
        }
      });
    };

    checkTimetable();
    const interval = setInterval(checkTimetable, 60000);
    return () => clearInterval(interval);
  }, [alertEnabled, voiceEnabled, timetable, notify, speak]);

  return null;
}

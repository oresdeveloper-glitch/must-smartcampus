import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { User, UserRole, Announcement, Note, Assignment, Chat, ChatMessage, AttendanceRecord, Notification, Badge, LeaderboardEntry, AnalyticsData, Course, TimetableEntry } from '../types';

function safeJSON<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

const STORAGE_KEYS = {
  DARK_MODE: 'smartlecture_darkMode',
  USER: 'smartlecture_user',
  CREDS: 'smartlecture_creds',
  COURSES: 'smartlecture_courses',
  NOTES: 'smartlecture_notes',
  ASSIGNMENTS: 'smartlecture_assignments',
  CHATS: 'smartlecture_chats',
  CHAT_MESSAGES: 'smartlecture_chatMessages',
  ATTENDANCE: 'smartlecture_attendance',
  NOTIFICATIONS: 'smartlecture_notifications',
  ANNOUNCEMENTS: 'smartlecture_announcements',
};



interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  darkMode: boolean;
  toggleDarkMode: () => void;

  courses: Course[];
  timetable: TimetableEntry[];
  announcements: Announcement[];
  notes: Note[];
  assignments: Assignment[];
  chats: Chat[];
  chatMessages: Record<string, ChatMessage[]>;
  attendanceRecords: AttendanceRecord[];
  notifications: Notification[];
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  analytics: AnalyticsData;

  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleBookmark: (noteId: string) => void;
  submitAssignment: (id: string, fileUrl?: string, fileName?: string) => void;
  sendMessage: (chatId: string, content: string, type?: 'text' | 'file' | 'voice' | 'image') => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'read' | 'senderId' | 'senderName'>) => void;
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'date'>) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  deleteCourse: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'downloads' | 'bookmarked' | 'uploaderId' | 'uploaderName'>) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'submitted' | 'createdAt'>) => void;
  addChat: (chat: Omit<Chat, 'id'>, initialMessage?: string) => string;
  updateUser: (updates: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => safeJSON<boolean>(localStorage.getItem(STORAGE_KEYS.DARK_MODE), false));

  const buildTimetable = (courses: Course[]) => {
    return courses.flatMap(course =>
      course.schedule.map(slot => ({
        id: `t-${course.id}-${slot.day}-${slot.startTime}`,
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        lecturerName: course.lecturerName,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: slot.room,
        type: slot.type,
      }))
    );
  };

  const seedCourses: Course[] = [
    {
      id: 'c-seed-1', code: 'TE411', name: 'Telecommunication Systems I', lecturerId: 'lec-seed-1',
      lecturerName: 'Dr. Mwambene', department: 'Telecommunication Engineering', faculty: 'Science & Technology',
      semester: 'II', schedule: [
        { day: 'Monday', startTime: '08:00', endTime: '10:00', room: 'LT 3', type: 'lecture' },
        { day: 'Wednesday', startTime: '08:00', endTime: '10:00', room: 'Lab 3', type: 'lab' },
      ], students: [],
    },
    {
      id: 'c-seed-2', code: 'TE412', name: 'Digital Signal Processing', lecturerId: 'lec-seed-2',
      lecturerName: 'Prof. Kalinga', department: 'Telecommunication Engineering', faculty: 'Science & Technology',
      semester: 'II', schedule: [
        { day: 'Tuesday', startTime: '09:00', endTime: '11:00', room: 'Lab 2', type: 'lecture' },
        { day: 'Thursday', startTime: '09:00', endTime: '11:00', room: 'Lab 2', type: 'lab' },
      ], students: [],
    },
    {
      id: 'c-seed-3', code: 'TE413', name: 'Microwave Engineering', lecturerId: 'lec-seed-3',
      lecturerName: 'Dr. Nyambo', department: 'Telecommunication Engineering', faculty: 'Science & Technology',
      semester: 'II', schedule: [
        { day: 'Monday', startTime: '14:00', endTime: '16:00', room: 'LT 1', type: 'lecture' },
        { day: 'Friday', startTime: '10:00', endTime: '12:00', room: 'MW Lab', type: 'lab' },
      ], students: [],
    },
    {
      id: 'c-seed-4', code: 'TE414', name: 'Optical Fiber Communications', lecturerId: 'lec-seed-4',
      lecturerName: 'Dr. Mbise', department: 'Telecommunication Engineering', faculty: 'Science & Technology',
      semester: 'II', schedule: [
        { day: 'Wednesday', startTime: '14:00', endTime: '16:00', room: 'LT 2', type: 'lecture' },
        { day: 'Thursday', startTime: '14:00', endTime: '16:00', room: 'Fiber Lab', type: 'lab' },
      ], students: [],
    },
    {
      id: 'c-seed-5', code: 'TE415', name: 'Wireless Communication Networks', lecturerId: 'lec-seed-5',
      lecturerName: 'Prof. Mwakyusa', department: 'Telecommunication Engineering', faculty: 'Science & Technology',
      semester: 'II', schedule: [
        { day: 'Tuesday', startTime: '14:00', endTime: '16:00', room: 'LT 3', type: 'lecture' },
        { day: 'Friday', startTime: '08:00', endTime: '10:00', room: 'Comm Lab', type: 'tutorial' },
      ], students: [],
    },
  ];

  const seedNotifications: Notification[] = [
    { id: 'n-seed-1', title: 'Welcome to MUST SmartCampus!', message: 'Your account has been created successfully. Explore the platform to get started.', type: 'info', read: false, createdAt: new Date(), actionable: false },
    { id: 'n-seed-2', title: 'Lab Session: TE411', message: 'Telecommunication Systems I lab moved to Lab 3 effective this week.', type: 'class-change', read: false, createdAt: new Date(), actionable: true },
    { id: 'n-seed-3', title: 'Assignment Due', message: 'DSP assignment due this Friday at 23:59.', type: 'reminder', read: false, createdAt: new Date(), actionable: true },
  ];

  const seedAnnouncements: Announcement[] = [
    { id: 'a-seed-1', title: 'TE Timetable Published', message: 'The official timetable for Semester II 2025/2026 (Bachelor of Telecommunication Engineering) is now available. Check your schedule under Timetable.', type: 'general', senderId: 'admin', senderName: 'Academic Office', targetRoles: ['student', 'lecturer'], createdAt: new Date(), read: false },
    { id: 'a-seed-2', title: 'Fiber Optics Workshop', message: 'A hands-on workshop on Optical Fiber splicing will be held this Saturday at the Fiber Lab. All TE students are encouraged to attend.', type: 'general', senderId: 'admin', senderName: 'TE Department', targetRoles: ['student'], createdAt: new Date(Date.now() - 86400000), read: false },
  ];

  const seedAssignments: Assignment[] = [
    { id: 'as-seed-1', title: 'DSP Filter Design', description: 'Design and simulate a digital FIR filter using MATLAB. Submit your code and a brief report.', courseId: 'c-seed-2', courseName: 'Digital Signal Processing', deadline: new Date(Date.now() + 86400000 * 5), maxScore: 100, submitted: false, createdAt: new Date() },
    { id: 'as-seed-2', title: 'Microwave Link Budget Analysis', description: 'Calculate the link budget for a point-to-point microwave link. Include all losses and fade margins.', courseId: 'c-seed-3', courseName: 'Microwave Engineering', deadline: new Date(Date.now() + 86400000 * 3), maxScore: 50, submitted: false, createdAt: new Date() },
  ];

  const [courses, setCourses] = useState<Course[]>(() =>
    safeJSON<Course[]>(localStorage.getItem(STORAGE_KEYS.COURSES), seedCourses)
  );
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    safeJSON<Announcement[]>(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS), seedAnnouncements)
  );
  const [notes, setNotes] = useState<Note[]>(() =>
    safeJSON<Note[]>(localStorage.getItem(STORAGE_KEYS.NOTES), [])
  );
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    safeJSON<Assignment[]>(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS), seedAssignments)
  );
  const seedChats: Chat[] = [
    { id: 'chat-seed-1', type: 'group', name: 'TE411 - Telecommunication Systems I', participants: ['lec-seed-1'], unread: 2, courseId: 'c-seed-1' },
    { id: 'chat-seed-2', type: 'group', name: 'TE412 - Digital Signal Processing', participants: ['lec-seed-2'], unread: 0, courseId: 'c-seed-2' },
    { id: 'chat-seed-3', type: 'group', name: 'TE IV - Class Group', participants: [], unread: 5 },
    { id: 'chat-seed-4', type: 'private', name: 'Dr. Mwambene', participants: ['lec-seed-1'], unread: 1 },
    { id: 'chat-seed-5', type: 'private', name: 'Prof. Kalinga', participants: ['lec-seed-2'], unread: 0 },
  ];

  const seedChatMessages: Record<string, ChatMessage[]> = {
    'chat-seed-1': [
      { id: 'm-seed-1', senderId: 'lec-seed-1', senderName: 'Dr. Mwambene', content: 'Welcome to Telecommunication Systems I! Please check the course outline in Notes.', type: 'text', timestamp: new Date(Date.now() - 86400000), read: false, reactions: [], pinned: false },
      { id: 'm-seed-2', senderId: 'lec-seed-1', senderName: 'Dr. Mwambene', content: 'Reminder: Lab session moved to Lab 3 this Thursday.', type: 'text', timestamp: new Date(Date.now() - 3600000), read: false, reactions: [], pinned: false },
    ],
    'chat-seed-3': [
      { id: 'm-seed-3', senderId: 'stud-seed-1', senderName: 'Anna Mwaka', content: 'Has anyone started the MW link budget assignment?', type: 'text', timestamp: new Date(Date.now() - 7200000), read: false, reactions: [], pinned: false },
      { id: 'm-seed-4', senderId: 'stud-seed-2', senderName: 'John Paulo', content: 'Yes, working on it now', type: 'text', timestamp: new Date(Date.now() - 3600000), read: false, reactions: [], pinned: false },
    ],
    'chat-seed-4': [
      { id: 'm-seed-5', senderId: 'lec-seed-1', senderName: 'Dr. Mwambene', content: 'Good morning! Feel free to reach out if you have any questions about TE411.', type: 'text', timestamp: new Date(Date.now() - 86400000 * 2), read: true, reactions: [], pinned: false },
    ],
  };

  const [chats, setChats] = useState<Chat[]>(() =>
    safeJSON<Chat[]>(localStorage.getItem(STORAGE_KEYS.CHATS), seedChats)
  );
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() =>
    safeJSON<Record<string, ChatMessage[]>>(localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES), seedChatMessages)
  );
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    safeJSON<AttendanceRecord[]>(localStorage.getItem(STORAGE_KEYS.ATTENDANCE), [])
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    safeJSON<Notification[]>(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS), seedNotifications)
  );
  const [badges] = useState<Badge[]>([]);
  const [leaderboard] = useState<LeaderboardEntry[]>([]);
  const [analytics] = useState<AnalyticsData>({
    totalStudents: 0, totalLecturers: 0, totalCourses: 0,
    attendanceRate: 0, latenessRate: 0, activeUsers: 0, engagementScore: 0, weeklyTrend: [],
  });

  useEffect(() => {
    setTimetable(buildTimetable(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const savedUser = safeJSON<User | null>(localStorage.getItem(STORAGE_KEYS.USER), null);
    if (savedUser) setUser(savedUser);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (!stored) return { success: false, error: 'No account found. Please sign up first.' };
    const storedUser = safeJSON<User | null>(stored, null);
    if (!storedUser) return { success: false, error: 'Account data corrupted. Please sign up again.' };
    if (storedUser.email !== email) return { success: false, error: 'Invalid email address.' };
    const storedCreds = localStorage.getItem(STORAGE_KEYS.CREDS);
    if (storedCreds) {
      const creds = safeJSON<{ password: string } | null>(storedCreds, null);
      if (creds && creds.password !== password) return { success: false, error: 'Incorrect password.' };
    }
    setUser(storedUser);
    return { success: true };
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${credential}` },
      });
      if (!res.ok) return { success: false, error: 'Google authentication failed.' };
      const info = await res.json();
      const email: string = info.email;
      const name: string = info.name || info.given_name || email.split('@')[0];
      const avatar: string = info.picture || '';

      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        const storedUser = safeJSON<User | null>(stored, null);
        if (storedUser && storedUser.email === email) {
          setUser({ ...storedUser, avatar: storedUser.avatar || avatar });
          return { success: true };
        }
      }

      const newUser: User = {
        id: `google-${Date.now()}`,
        name, email, role: 'student',
        avatar, department: 'Pending', faculty: 'Pending',
        studentId: `STU-${Date.now()}`,
        createdAt: new Date(),
        verified: true,
      };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      return { success: true };
    } catch {
      return { success: false, error: 'Google sign-in failed. Please try again.' };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    await new Promise(r => setTimeout(r, 800));
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: '',
      department: 'Pending',
      faculty: 'Pending',
      studentId: role === 'student' ? `STU-${Date.now()}` : undefined,
      staffId: role === 'lecturer' ? `STF-${Date.now()}` : undefined,
      createdAt: new Date(),
      verified: true,
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.CREDS, JSON.stringify({ email, password }));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CREDS);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
  }, [user]);

  const toggleDarkMode = useCallback(() => setDarkMode((d: boolean) => !d), []);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `n-${Date.now()}`,
      createdAt: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const toggleBookmark = useCallback((noteId: string) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, bookmarked: !n.bookmarked } : n));
  }, []);

  const submitAssignment = useCallback((id: string, fileUrl?: string, fileName?: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, submitted: true, submittedAt: new Date(), fileUrl: fileUrl || a.fileUrl, fileName: fileName || a.fileName } : a));
  }, []);

  const sendMessage = useCallback((chatId: string, content: string, type: 'text' | 'file' | 'voice' | 'image' = 'text') => {
    if (!user) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      content,
      type,
      timestamp: new Date(),
      read: false,
      reactions: [],
      pinned: false,
    };
    setChatMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMessage: newMsg } : c));
  }, [user]);

  const addAnnouncement = useCallback((announcement: Omit<Announcement, 'id' | 'createdAt' | 'read' | 'senderId' | 'senderName'>) => {
    if (!user) return;
    const newAnn: Announcement = {
      ...announcement,
      id: `a-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      createdAt: new Date(),
      read: false,
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    const notifType = announcement.type === 'emergency' ? 'emergency' : announcement.type === 'class-change' ? 'class-change' : 'alert';
    const newNotif: Notification = {
      id: `n-${Date.now() + 1}`,
      title: announcement.title,
      message: announcement.message,
      type: notifType as Notification['type'],
      read: false,
      createdAt: new Date(),
      actionable: true,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, [user]);

  const markAttendance = useCallback((record: Omit<AttendanceRecord, 'id' | 'date'>) => {
    const newRec: AttendanceRecord = { ...record, id: `at-${Date.now()}`, date: new Date() };
    setAttendanceRecords(prev => [newRec, ...prev]);
  }, []);

  const addCourse = useCallback((course: Omit<Course, 'id'>) => {
    const newCourse: Course = { ...course, id: `c-${Date.now()}` };
    setCourses(prev => [...prev, newCourse]);
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'downloads' | 'bookmarked' | 'uploaderId' | 'uploaderName'>) => {
    if (!user) return;
    const newNote: Note = { ...note, id: `n-${Date.now()}`, createdAt: new Date(), downloads: 0, bookmarked: false, uploaderId: user.id, uploaderName: user.name };
    setNotes(prev => [newNote, ...prev]);
  }, [user]);

  const addAssignment = useCallback((assignment: Omit<Assignment, 'id' | 'submitted' | 'createdAt'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: `as-${Date.now()}`,
      submitted: false,
      createdAt: new Date(),
    };
    setAssignments(prev => [newAssignment, ...prev]);
  }, []);

  const addChat = useCallback((chat: Omit<Chat, 'id'>, initialMessage?: string) => {
    const newChat: Chat = { ...chat, id: `chat-${Date.now()}` };
    setChats(prev => [...prev, newChat]);
    const msgs: ChatMessage[] = [];
    if (initialMessage && user) {
      msgs.push({
        id: `m-${Date.now() + 1}`,
        senderId: 'system',
        senderName: '',
        content: initialMessage,
        type: 'text',
        timestamp: new Date(),
        read: false,
        reactions: [],
        pinned: false,
      });
    }
    setChatMessages(prev => ({ ...prev, [newChat.id]: msgs }));
    return newChat.id;
  }, [user]);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  const value = useMemo<AppContextType>(() => ({
    user, isAuthenticated: !!user, isLoading, login, googleLogin, signup, logout, switchRole,
    darkMode, toggleDarkMode,
    courses, timetable, announcements, notes, assignments, chats, chatMessages, attendanceRecords, notifications, badges, leaderboard, analytics,
    addNotification, markNotificationRead, markAllNotificationsRead, toggleBookmark, submitAssignment, sendMessage, addAnnouncement, markAttendance, addCourse, deleteCourse, addNote, addAssignment, addChat, updateUser,
  }), [
    user, isLoading, login, googleLogin, signup, logout, switchRole,
    darkMode, toggleDarkMode,
    courses, timetable, announcements, notes, assignments, chats, chatMessages, attendanceRecords, notifications, badges, leaderboard, analytics,
    addNotification, markNotificationRead, markAllNotificationsRead, toggleBookmark, submitAssignment, sendMessage, addAnnouncement, markAttendance, addCourse, deleteCourse, addNote, addAssignment, addChat, updateUser,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

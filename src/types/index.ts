export type UserRole = 'admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  faculty?: string;
  studentId?: string;
  staffId?: string;
  phone?: string;
  createdAt: Date;
  verified: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturerId: string;
  lecturerName: string;
  department: string;
  faculty: string;
  semester: string;
  schedule: LectureSlot[];
  students: string[];
}

export interface LectureSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  room: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'project';
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  lecturerName: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'general' | 'emergency' | 'class-change' | 'exam' | 'reminder';
  senderId: string;
  senderName: string;
  targetRoles: UserRole[];
  targetCourse?: string;
  createdAt: Date;
  read: boolean;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  fileType: 'pdf' | 'docx' | 'ppt' | 'image' | 'video' | 'audio';
  fileUrl: string;
  fileSize: string;
  uploaderId: string;
  uploaderName: string;
  createdAt: Date;
  downloads: number;
  bookmarked: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  deadline: Date;
  maxScore: number;
  fileUrl?: string;
  fileName?: string;
  submitted: boolean;
  submittedAt?: Date;
  grade?: number;
  feedback?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'file' | 'voice' | 'image';
  fileUrl?: string;
  timestamp: Date;
  read: boolean;
  replyTo?: string;
  reactions: string[];
  pinned: boolean;
}

export interface Chat {
  id: string;
  type: 'private' | 'group';
  name: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unread: number;
  courseId?: string;
  isOnline?: boolean;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  method: 'manual' | 'qr' | 'auto';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'info' | 'emergency' | 'class-change';
  read: boolean;
  createdAt: Date;
  courseId?: string;
  actionable: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  rank: number;
  streak: number;
  perfectAttendance: number;
}

export interface AnalyticsData {
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
  attendanceRate: number;
  latenessRate: number;
  activeUsers: number;
  engagementScore: number;
  weeklyTrend: { day: string; attendance: number; lateness: number }[];
}

export interface Appointment {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  lecturerId: string;
  lecturerName: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'consultation' | 'project_review' | 'academic_advising' | 'other';
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

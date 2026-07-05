import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import StudentDashboard from './screens/StudentDashboard';
import LecturerDashboard from './screens/LecturerDashboard';
import AdminDashboard from './screens/AdminDashboard';
import TimetableScreen from './screens/TimetableScreen';
import NotificationsPage from './screens/NotificationsPage';
import ChatScreen from './screens/ChatScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import NotesScreen from './screens/NotesScreen';
import AssignmentScreen from './screens/AssignmentScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EmergencyAlertsScreen from './screens/EmergencyAlertsScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import UserManageScreen from './screens/UserManageScreen';
import CourseManageScreen from './screens/CourseManageScreen';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useApp();
  if (isLoading) return <SplashScreen />;

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'lecturer') return <Navigate to="/lecturer" replace />;
    return <Navigate to="/student" replace />;
  }
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, isLoading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      const stripped = redirect.replace(/^\/must-smartcampus/, '');
      navigate(stripped || '/', { replace: true });
    }
  }, [navigate]);

  if (isLoading) return <SplashScreen />;

  return (
    <Routes>
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/login" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : user.role === 'lecturer' ? <Navigate to="/lecturer" /> : <Navigate to="/student" />) : <LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/role-selection" element={<RoleSelectionScreen />} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute roles={['student']}><TimetableScreen /></ProtectedRoute>} />
      <Route path="/student/notifications" element={<ProtectedRoute roles={['student']}><NotificationsPage /></ProtectedRoute>} />
      <Route path="/student/chat" element={<ProtectedRoute roles={['student']}><ChatScreen /></ProtectedRoute>} />
      <Route path="/student/chat/:chatId" element={<ProtectedRoute roles={['student']}><ChatDetailScreen /></ProtectedRoute>} />
      <Route path="/student/notes" element={<ProtectedRoute roles={['student']}><NotesScreen /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute roles={['student']}><AssignmentScreen /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute roles={['student']}><AttendanceScreen /></ProtectedRoute>} />
      <Route path="/student/analytics" element={<ProtectedRoute roles={['student']}><AnalyticsScreen /></ProtectedRoute>} />
      <Route path="/student/settings" element={<ProtectedRoute roles={['student']}><SettingsScreen /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><ProfileScreen /></ProtectedRoute>} />
      <Route path="/student/emergency" element={<ProtectedRoute roles={['student']}><EmergencyAlertsScreen /></ProtectedRoute>} />
      <Route path="/student/appointments" element={<ProtectedRoute roles={['student']}><AppointmentScreen /></ProtectedRoute>} />

      {/* Lecturer Routes */}
      <Route path="/lecturer" element={<ProtectedRoute roles={['lecturer']}><LecturerDashboard /></ProtectedRoute>} />
      <Route path="/lecturer/timetable" element={<ProtectedRoute roles={['lecturer']}><TimetableScreen /></ProtectedRoute>} />
      <Route path="/lecturer/notifications" element={<ProtectedRoute roles={['lecturer']}><NotificationsPage /></ProtectedRoute>} />
      <Route path="/lecturer/chat" element={<ProtectedRoute roles={['lecturer']}><ChatScreen /></ProtectedRoute>} />
      <Route path="/lecturer/chat/:chatId" element={<ProtectedRoute roles={['lecturer']}><ChatDetailScreen /></ProtectedRoute>} />
      <Route path="/lecturer/notes" element={<ProtectedRoute roles={['lecturer']}><NotesScreen /></ProtectedRoute>} />
      <Route path="/lecturer/assignments" element={<ProtectedRoute roles={['lecturer']}><AssignmentScreen /></ProtectedRoute>} />
      <Route path="/lecturer/attendance" element={<ProtectedRoute roles={['lecturer']}><AttendanceScreen /></ProtectedRoute>} />
      <Route path="/lecturer/analytics" element={<ProtectedRoute roles={['lecturer']}><AnalyticsScreen /></ProtectedRoute>} />
      <Route path="/lecturer/settings" element={<ProtectedRoute roles={['lecturer']}><SettingsScreen /></ProtectedRoute>} />
      <Route path="/lecturer/profile" element={<ProtectedRoute roles={['lecturer']}><ProfileScreen /></ProtectedRoute>} />
      <Route path="/lecturer/emergency" element={<ProtectedRoute roles={['lecturer']}><EmergencyAlertsScreen /></ProtectedRoute>} />
      <Route path="/lecturer/appointments" element={<ProtectedRoute roles={['lecturer']}><AppointmentScreen /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/timetable" element={<ProtectedRoute roles={['admin']}><TimetableScreen /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute roles={['admin']}><NotificationsPage /></ProtectedRoute>} />
      <Route path="/admin/chat" element={<ProtectedRoute roles={['admin']}><ChatScreen /></ProtectedRoute>} />
      <Route path="/admin/chat/:chatId" element={<ProtectedRoute roles={['admin']}><ChatDetailScreen /></ProtectedRoute>} />
      <Route path="/admin/notes" element={<ProtectedRoute roles={['admin']}><NotesScreen /></ProtectedRoute>} />
      <Route path="/admin/assignments" element={<ProtectedRoute roles={['admin']}><AssignmentScreen /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute roles={['admin']}><AttendanceScreen /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AnalyticsScreen /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><SettingsScreen /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute roles={['admin']}><ProfileScreen /></ProtectedRoute>} />
      <Route path="/admin/emergency" element={<ProtectedRoute roles={['admin']}><EmergencyAlertsScreen /></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute roles={['admin']}><AppointmentScreen /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManageScreen /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute roles={['admin']}><CourseManageScreen /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'lecturer' ? '/lecturer' : '/student') : '/onboarding'} replace />} />
      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'lecturer' ? '/lecturer' : '/student') : '/onboarding'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/must-smartcampus">
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

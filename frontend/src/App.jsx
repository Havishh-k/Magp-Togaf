import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VendorSubmission from './pages/VendorSubmission';
import SystemDetail from './pages/SystemDetail';
import AuditLog from './pages/AuditLog';
import Notifications from './pages/Notifications';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit" element={<VendorSubmission />} />
        <Route path="/system/:id" element={<SystemDetail />} />
        <Route path="/audit" element={<AuditLog />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
}

import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

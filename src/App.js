import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import authService from './services/authService';

// Import pages
import RegistrationPage from './pages/RegistrationPage';
import RegistrationSuccess from './pages/RegistrationSuccess';
import LoginPage from './pages/LoginPage';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorManage from './pages/dashboards/DoctorManage';
import PatientManage from './pages/dashboards/PatientManage';
import TreatmentsManage from './pages/dashboards/TreatmentsManage';
import ProcedureManage from './pages/dashboards/ProcedureManage';
import ForgotPassword from './pages/ForgotPassword';
import OtpPage from './pages/OtpPage';
import PassReset from './pages/PassReset';

// Protected Route component that redirects to appropriate dashboard if already authenticated
const ProtectedAuthRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  const userType = authService.getUserType();
  
  if (isAuth) {
    // Redirect to the appropriate dashboard based on user type
    if (userType === 'doctor') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/patient-dashboard" replace />;
    }
  }
  
  return children;
};

// Protected Route component that checks if user is authenticated
const PrivateRoute = ({ userTypes, children }) => {
  const isAuth = authService.isAuthenticated();
  const userType = authService.getUserType();
  
  if (!isAuth) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // If userTypes is specified, check if current user type is allowed
  if (userTypes && !userTypes.includes(userType)) {
    // Redirect to the appropriate dashboard based on user type
    if (userType === 'doctor') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/patient-dashboard" replace />;
    }
  }
  
  return children;
};

// Route component for password reset flow that only allows access with proper state
const PasswordResetRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();
  
  // Redirect authenticated users to their dashboard
  if (isAuth) {
    const userType = authService.getUserType();
    if (userType === 'doctor') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/patient-dashboard" replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes that redirect to dashboard if already logged in */}
        <Route path="/" element={
          <ProtectedAuthRoute>
            <RegistrationPage />
          </ProtectedAuthRoute>
        } />
        <Route path="/registration-success" element={
          <ProtectedAuthRoute>
            <RegistrationSuccess />
          </ProtectedAuthRoute>
        } />
        <Route path="/login" element={
          <ProtectedAuthRoute>
            <LoginPage />
          </ProtectedAuthRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected routes that require authentication */}
        <Route path="/doctor-dashboard" element={
          <PrivateRoute userTypes={['doctor']}>
            <DoctorDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard" element={
          <PrivateRoute userTypes={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/patient-dashboard" element={
          <PrivateRoute userTypes={['patient']}>
            <PatientDashboard />
          </PrivateRoute>
        } />
        
        {/* Admin-specific routes */}
        <Route path="/doctor-manage" element={
          <PrivateRoute userTypes={['admin']}>
            <DoctorManage />
          </PrivateRoute>
        } />
        <Route path="/patient-manage" element={
          <PrivateRoute userTypes={['admin']}>
            <PatientManage />
          </PrivateRoute>
        } />
        <Route path="/treatments-manage" element={
          <PrivateRoute userTypes={['admin']}>
            <TreatmentsManage />
          </PrivateRoute>
        } />          <Route path="/admin/procedures/:treatmentId" element={
            <PrivateRoute userTypes={['admin']}>
              <ProcedureManage />
            </PrivateRoute>
          } />
          

        {/* OTP and Password Reset routes */}
        <Route path="/otp" element={
          <PasswordResetRoute>
            <OtpPage />
          </PasswordResetRoute>
        }/>
        <Route path="/reset-password" element={
          <PasswordResetRoute>
            <PassReset />
          </PasswordResetRoute>
        } />
        
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

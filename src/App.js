// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoanInputScreen from './components/LoanInputScreen';
import MobileSelectionScreen from './components/MobileSelectionScreen';
import OtpScreen from './components/OtpScreen';
import TicketFormScreen from './components/TicketFormScreen';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './components/NotFoundPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<LoanInputScreen />} />
            <Route path="/select-mobile" element={
              <ProtectedRoute check="isAuthenticated">
                <MobileSelectionScreen />
              </ProtectedRoute>
            } />
            <Route path="/verify-otp" element={
              <ProtectedRoute check="hasSelectedMobile">
                <OtpScreen />
              </ProtectedRoute>
            } />
            <Route path="/register-ticket" element={
              <ProtectedRoute check="hasVerifiedOTP">
                <TicketFormScreen />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;

// src/contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    hasSelectedMobile: false,
    hasVerifiedOTP: false
  });

  const setAuthenticated = (status) => {
    setAuthState(prevState => ({ ...prevState, isAuthenticated: status }));
  };

  const setMobileSelected = (status) => {
    setAuthState(prevState => ({ ...prevState, hasSelectedMobile: status }));
  };

  const setOtpVerified = (status) => {
    setAuthState(prevState => ({ ...prevState, hasVerifiedOTP: status }));
  };

  return (
    <AuthContext.Provider value={{
      authState,
      setAuthenticated,
      setMobileSelected,
      setOtpVerified
    }}>
      {children}
    </AuthContext.Provider>
  );
};

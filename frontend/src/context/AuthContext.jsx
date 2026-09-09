import React, { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loginWithCredentials = async (email, password = '', name = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password, name);
      const userData = res.data.user;
      setUser(userData);
      localStorage.setItem('lms_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.error("Login failed:", err);
      const msg = err.response?.data?.detail 
        || (!err.response ? "Unable to connect to backend API server. Please check backend deployment & VITE_API_URL setting." : "Authentication failed. Please check credentials.");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

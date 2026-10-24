import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cl_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const saveAuth = (token, userData) => {
    localStorage.setItem('cl_token', token);
    localStorage.setItem('cl_user', JSON.stringify(userData));
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem('cl_token');
    localStorage.removeItem('cl_user');
    setUser(null);
  };

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('cl_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
      localStorage.setItem('cl_user', JSON.stringify(res.data.user));
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { verifyToken(); }, [verifyToken]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const logout = () => { clearAuth(); };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cl_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

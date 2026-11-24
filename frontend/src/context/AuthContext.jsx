import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify user from backend
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch {
          // Token is invalid/expired and refresh failed in axios interceptor
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to auto-logout event emitted from axios interceptor
    const handleAutoLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:logout', handleAutoLogout);
    return () => window.removeEventListener('auth:logout', handleAutoLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await authService.login({ username, password });
    const { access, refresh, user: userData } = data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(access);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const data = await authService.register({ username, email, password });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(isAuthenticated && (user.role === 'admin' || user.is_staff || user.is_superuser));
  const isCustomer = Boolean(isAuthenticated && user.role === 'user');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

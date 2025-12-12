import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // load user on mount if jwt token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const data = await authApi.getCurrentUser(token);
          setUser(data.user || data);
        } catch (error) {
          console.error('Failed to load user:', error);
          // clear invalid token
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    console.log('Login response:', data);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const data = await authApi.register(username, email, password);
    console.log('Register response:', data);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  // Debug logging
  console.log('AuthContext state:', { user, token: !!token, isAuthenticated: !!user });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar el estado de autenticación
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      });

      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setError(error.response?.data?.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password,
      }, {
        withCredentials: true
      });

      // Verificar autenticación después del login
      await checkAuth();

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error de inicio de sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  // Signup
  const signup = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/auth/signup`, userData, {
        withCredentials: true
      });

      // Verificar autenticación después del signup
      await checkAuth();

      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Error de registro');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true
      });

      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Aún así, limpiar el estado local
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar email
  const checkEmailVerification = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      });
      
      if (response.data.authenticated && response.data.user.isEmailVerified !== user.isEmailVerified) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    }
  }, [user]);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Verificar email periódicamente si no está verificado
  useEffect(() => {
    if (!user || user.isEmailVerified) return;

    const interval = setInterval(checkEmailVerification, 5000);
    return () => clearInterval(interval);
  }, [user, checkEmailVerification]);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    isAuthenticated: !!user,
    isEmailVerified: user?.isEmailVerified || false,
  };
}; 
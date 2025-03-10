// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.ok) {
        setUser(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  // Obtener la ruta inicial según el rol del usuario
  const getInitialRoute = (userRole) => {
    switch (userRole) {
      case 'contable':
        return '/logistica/facturas';
      case 'transportista':
      case 'admin':
      default:
        return '/logistica/home';
    }
  };

  const logout = () => {
    try {
      authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Verificar token en intervalos regulares
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser && user) {
        setUser(null);
      }
    };

    const interval = setInterval(checkAuth, 1000); // Verificar cada segundo

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      getInitialRoute 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
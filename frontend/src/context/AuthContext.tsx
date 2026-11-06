import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuditor: boolean;
  isAccountHolder: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ledgerline_token');
      if (token) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
        } catch {
          apiClient.clearAuth();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, refreshToken: string, userData: User) => {
    localStorage.setItem('ledgerline_token', token);
    localStorage.setItem('ledgerline_refresh_token', refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const roles = user?.roles || [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isAuditor = roles.includes('ROLE_AUDITOR');
  const isAccountHolder = roles.includes('ROLE_ACCOUNT_HOLDER');

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isAuditor, isAccountHolder }}>
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

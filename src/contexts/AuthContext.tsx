import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  dashboardModules?: string[];
  avatar?: string;
  phone?: string;
  shift?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  restaurantId: string | null;
  isAuthenticated: boolean;
  login: (data: { user: User; accessToken: string }, restaurantId: string) => void;
  logout: () => void;
  hasPermission: (requiredPermission: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialAuthState = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    const storedRestaurantId = localStorage.getItem('restaurantId');

    return {
      user: storedUser ? (JSON.parse(storedUser) as User) : null,
      accessToken: storedToken || null,
      restaurantId: storedRestaurantId || null,
    };
  } catch (error) {
    console.error('Failed to parse auth data from localStorage', error);
    return { user: null, accessToken: null, restaurantId: null };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialState = getInitialAuthState();
  const [user, setUser] = useState<User | null>(initialState.user);
  const [accessToken, setAccessToken] = useState<string | null>(initialState.accessToken);
  const [restaurantId, setRestaurantId] = useState<string | null>(initialState.restaurantId);
  const navigate = useNavigate();

  const login = (data: { user: User; accessToken: string }, resId: string) => {
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('restaurantId', resId);
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRestaurantId(resId);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('restaurantId');
    setUser(null);
    setAccessToken(null);
    setRestaurantId(null);
    navigate('/login');
  };

  const hasPermission = (required: string | string[]): boolean => {
    if (!user?.permissions) return false;
    if (user.permissions.includes('all_access')) return true;
    
    const requiredPermissions = Array.isArray(required) ? required : [required];
    return requiredPermissions.every(p => user.permissions.includes(p));
  };

  const isAuthenticated = !!accessToken && !!user;

  return (
    <AuthContext.Provider value={{ user, accessToken, restaurantId, isAuthenticated, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

export interface UserSkill {
  _id: string;
  name: string;
  category: string;
  difficulty?: string;
  icon?: string;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  role: 'LEARNER' | 'PROVIDER' | 'ADMIN';
  creditsBalance: number;
  bio?: string;
  city?: string;
  preferredLearningMode?: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  languages?: string[];
  skillsOffered?: UserSkill[] | string[];
  skillsWanted?: UserSkill[] | string[];
  profilePicture?: string | null;
  completedSessions?: number;
  averageRating?: number;
}

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  city?: string;
  preferredLearningMode?: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  role?: 'LEARNER' | 'PROVIDER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('lse_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data?.success && response.data?.data?.user) {
          setUser(response.data.data.user);
        } else {
          // In case token was invalid
          localStorage.removeItem('lse_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        // Token expired or invalid
        localStorage.removeItem('lse_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await api.post('/auth/login', { identifier, password });
    if (response.data?.success && response.data?.data) {
      const { token: receivedToken, user: receivedUser } = response.data.data;
      localStorage.setItem('lse_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    }
  };

  const register = async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    if (response.data?.success && response.data?.data) {
      const { token: receivedToken, user: receivedUser } = response.data.data;
      localStorage.setItem('lse_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('lse_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user);
      }
    } catch (err) {
      console.warn('Could not refresh user session:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


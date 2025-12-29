import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User as ApiUser } from '../api/auth';
import { getToken, removeToken } from '../api/client';

// Define what our auth state looks like
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;           // The logged-in user (null if not logged in)
  isLoggedIn: boolean;         // Quick check for auth state
  isLoading: boolean;          // Loading state for initial auth check
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Create the context with undefined as default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert API user to local user format
const convertUser = (apiUser: ApiUser): User => ({
  id: apiUser._id,
  name: apiUser.name,
  email: apiUser.email,
  avatar: apiUser.avatar,
  bio: apiUser.bio,
});

// AuthProvider component - wraps your app and provides auth state to all children
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      
      if (token) {
        // Try to get current user
        const response = await authAPI.getMe();
        
        if (response.data?.user) {
          setUser(convertUser(response.data.user));
        } else {
          // Token is invalid, remove it
          await removeToken();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  // Computed property - user exists means logged in
  const isLoggedIn = user !== null;

  // Login function - called from LoginScreen
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.error) {
        return { success: false, error: response.error };
      }
      
      if (response.data?.user) {
        setUser(convertUser(response.data.user));
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Signup function - called from SignupScreen
  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.signup(name, email, password);
      
      if (response.error) {
        return { success: false, error: response.error };
      }
      
      if (response.data?.user) {
        setUser(convertUser(response.data.user));
        return { success: true };
      }
      
      return { success: false, error: 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Logout function - called from ProfileScreen/SettingsScreen
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  // Update user data locally
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  // The value object that will be available to all children
  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

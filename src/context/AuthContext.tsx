import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '../types/auth';
import { supabase } from '../utils/supabaseClient';
import { formatSupabaseError } from '../utils/errorHandling';

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Supabase session to UserProfile
  const sessionToUserProfile = (session: Session | null): UserProfile | null => {
    if (!session?.user) return null;
    
    return {
      id: session.user.id,
      email: session.user.email || '',
      created_at: session.user.created_at,
    };
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get the current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const userProfile = sessionToUserProfile(data.session);
        setUser(userProfile);
        setIsAuthenticated(!!userProfile);
      } catch (error) {
        console.error('Error checking session:', error);
        setError(formatSupabaseError(error));
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const userProfile = sessionToUserProfile(session);
        setUser(userProfile);
        setIsAuthenticated(!!userProfile);
        setIsLoading(false);
      }
    );

    checkSession();

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function - sends OTP to email
  const login = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      // Send OTP to email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(formatSupabaseError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP function
  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate OTP format
      if (!otp || otp.length < 6) {
        throw new Error('Please enter a valid verification code');
      }
      
      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      
      if (error) {
        throw error;
      }
      
      const userProfile = sessionToUserProfile(data.session);
      setUser(userProfile);
      setIsAuthenticated(!!userProfile);
      
      return true;
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(formatSupabaseError(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      setError(formatSupabaseError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update user metadata in Supabase auth
      if (profile.email) {
        const { error } = await supabase.auth.updateUser({
          email: profile.email,
        });
        
        if (error) {
          throw error;
        }
      }
      
      // Update profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          phone: profile.phone,
          // Add other fields as needed
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...profile } : null);
    } catch (error) {
      console.error('Update profile error:', error);
      setError(formatSupabaseError(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    verifyOtp,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
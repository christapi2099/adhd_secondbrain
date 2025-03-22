// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Ensure the browser redirects back to your app
WebBrowser.maybeCompleteAuthSession();

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'google';
  token?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<AuthResult>;
  signup: (email: string, password: string) => Promise<AuthResult>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create a context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  googleSignIn: async () => ({ success: false }),
  signup: async () => ({ success: false }),
});

// Create a provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set up Google Auth - replace with your own Client ID
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_EXPO_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  // Check if user is logged in
  useEffect(() => {
    const bootstrapAsync = async (): Promise<void> => {
      try {
        const userJSON = await SecureStore.getItemAsync('user');
        if (userJSON) {
          setUser(JSON.parse(userJSON));
        }
      } catch (e) {
        console.error('Failed to load user from storage', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Handle Google Auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // You would normally send this token to your backend
      // For demo, we'll just create a mock user
      const mockUser: User = {
        id: 'google-user-id',
        email: 'user@example.com',
        name: 'Google User',
        provider: 'google',
        token: authentication?.accessToken || '',
      };
      handleAuthSuccess(mockUser);
    }
  }, [response]);

  const handleAuthSuccess = async (userData: User): Promise<void> => {
    setUser(userData);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
  };

  // Traditional login with email/password
  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you'd validate credentials with your API
      // For demo purposes, any email/password combination works
      const userData: User = {
        id: 'user-id-123',
        email,
        name: email.split('@')[0],
        provider: 'email',
      };
      
      await handleAuthSuccess(userData);
      return { success: true };
    } catch (error) {
      const e = error as Error;
      return { success: false, error: e.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup with email/password
  const signup = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you'd register the user with your API
      const userData: User = {
        id: 'new-user-id-' + Date.now(),
        email,
        name: email.split('@')[0],
        provider: 'email',
      };
      
      await handleAuthSuccess(userData);
      return { success: true };
    } catch (error) {
      const e = error as Error;
      return { success: false, error: e.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in
  const googleSignIn = async (): Promise<AuthResult> => {
    try {
      await promptAsync();
      // The response is handled in the useEffect above
      return { success: true };
    } catch (error) {
      const e = error as Error;
      console.error('Google sign in error:', error);
      return { success: false, error: e.message };
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, googleSignIn, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = (): AuthContextType => useContext(AuthContext);
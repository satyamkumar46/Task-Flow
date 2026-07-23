import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';

declare const process: any;

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID || '502199329090-g80f9bjrq04o5uq9jqn4avdebua9g69d.apps.googleusercontent.com',
  iosClientId: '502199329090-g80f9bjrq04o5uq9jqn4avdebua9g69d.apps.googleusercontent.com',
});

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      // In newer versions of the library, the sign-in response structure contains idToken directly or inside data
      const idToken = response.data?.idToken || (response as any).idToken;
      if (!idToken) {
        throw new Error('Google Sign-In failed: No ID Token retrieved.');
      }
      const credential = GoogleAuthProvider.credential(idToken);
      return signInWithCredential(auth, credential);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut().catch(() => { });
    } catch (e) { }
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserPassword = (newPassword: string) => {
    if (auth.currentUser) {
      return updatePassword(auth.currentUser, newPassword);
    }
    return Promise.reject(new Error("No user is currently authenticated to perform this password change."));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, resetPassword, updateUserPassword }}>
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

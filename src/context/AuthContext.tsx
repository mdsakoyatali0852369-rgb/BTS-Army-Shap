import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, ADMIN_CONFIG } from '../firebase/config';
import { syncCustomerProfile } from '../firebase/services';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isAuthReady: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAdminPrivilege = async (user: User | null): Promise<boolean> => {
    if (!user) return false;
    // 1. Direct configured admin UID check
    if (user.uid === ADMIN_CONFIG.uid || ADMIN_CONFIG.adminUids.includes(user.uid)) return true;
    // 2. Direct configured admin email check
    if (user.email) {
      const emailLower = user.email.toLowerCase();
      if (emailLower === ADMIN_CONFIG.email.toLowerCase() || ADMIN_CONFIG.adminEmails.map(e => e.toLowerCase()).includes(emailLower)) {
        return true;
      }
    }
    // 3. Check /admins collection
    try {
      const adminSnap = await getDoc(doc(db, 'admins', user.uid));
      if (adminSnap.exists()) return true;
    } catch {
      // ignore
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const hasAdmin = await checkAdminPrivilege(user);
        setIsAdmin(hasAdmin);
        // Sync customer profile
        await syncCustomerProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
        });
      } else {
        setIsAdmin(false);
      }
      setIsAuthReady(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const hasAdmin = await checkAdminPrivilege(res.user);
      setIsAdmin(hasAdmin);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(res.user, { displayName: name.trim() });
      await syncCustomerProfile({
        uid: res.user.uid,
        email: res.user.email,
        displayName: name.trim(),
        phoneNumber: phone,
      });
      const hasAdmin = await checkAdminPrivilege(res.user);
      setIsAdmin(hasAdmin);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const hasAdmin = await checkAdminPrivilege(res.user);
      setIsAdmin(hasAdmin);
      await syncCustomerProfile({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        phoneNumber: res.user.phoneNumber,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isAuthReady,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
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

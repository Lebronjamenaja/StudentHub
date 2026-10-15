import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginOrRegisterTestAccount: (email: string, pass: string, displayName: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileName: (newName: string) => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_BOOTSTRAP_EMAIL = 'buddykung2019@gmail.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      const isBootstrappedAdmin = (user.email || '').toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();

      // Check admins collection
      let hasAdminDoc = false;
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        hasAdminDoc = adminDoc.exists();
      } catch {
        // Ignored if permissions restrict
      }

      const assignedRole: UserRole = (isBootstrappedAdmin || hasAdminDoc) ? 'admin' : 'student';

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        // If user is bootstrapped admin, grant admin role
        if (isBootstrappedAdmin && data.role !== 'admin') {
          await updateDoc(userRef, { role: 'admin' });
          data.role = 'admin';
        }
        setUserProfile(data);
      } else {
        // First-time profile initialization (e.g. from Google login or new user)
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'นักศึกษา',
          role: assignedRole,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, newProfile);

        // If bootstrapped admin, also create entry in admins collection
        if (assignedRole === 'admin') {
          try {
            await setDoc(doc(db, 'admins', user.uid), {
              uid: user.uid,
              email: user.email || '',
              grantedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn('Admin record write check:', e);
          }
        }

        setUserProfile(newProfile);
      }
    } catch (err: unknown) {
      console.error('Failed to sync user profile:', err);
      // Fallback in-memory profile if firestore write is pending
      const isBootstrappedAdmin = (user.email || '').toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
      setUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'ผู้ใช้งาน',
        role: isBootstrappedAdmin ? 'admin' : 'student',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchProfile(userCredential.user);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      const errCode = (err as { code?: string })?.code || '';
      console.error('Firebase Auth Login Error:', errCode, errMessage);

      if (errCode === 'auth/operation-not-allowed' || errMessage.includes('operation-not-allowed')) {
        setError('⚠️ ยังไม่ได้เปิดใช้งาน Email/Password ใน Firebase Console: โปรดไปที่ Firebase Console > Authentication > แท็บ Sign-in method > กด Email/Password แล้วเปิดสวิตช์ Enable');
      } else if (
        errCode === 'auth/invalid-credential' ||
        errCode === 'auth/user-not-found' ||
        errCode === 'auth/wrong-password' ||
        errMessage.includes('invalid-credential') ||
        errMessage.includes('user-not-found')
      ) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่มีบัญชีนี้ใน Firebase (หากเพิ่งใช้ครั้งแรก โปรดกด "สมัครสมาชิกใหม่" หรือใช้ปุ่มเข้าสู่ระบบอัตโนมัติ)');
      } else if (errCode === 'auth/too-many-requests' || errMessage.includes('too-many-requests')) {
        setError('พยายามเข้าสู่ระบบมากเกินไป โปรดรอสักครู่แล้วลองใหม่');
      } else if (errCode === 'auth/network-request-failed' || errMessage.includes('network-request-failed')) {
        setError('ไม่สามารถเชื่อมต่อเครือข่าย Firebase ได้ โปรดตรวจสอบอินเทอร์เน็ต');
      } else {
        setError(`ไม่สามารถเข้าสู่ระบบได้ (${errCode || errMessage})`);
      }
      throw err;
    }
  };

  const loginOrRegisterTestAccount = async (
    email: string,
    pass: string,
    displayName: string,
    targetRole: UserRole
  ) => {
    setError(null);
    try {
      // 1. Try normal login first
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
        await fetchProfile(userCredential.user);
        return;
      } catch (loginErr: unknown) {
        const loginErrCode = (loginErr as { code?: string })?.code || '';
        const loginErrMsg = loginErr instanceof Error ? loginErr.message : String(loginErr);

        if (loginErrCode === 'auth/operation-not-allowed' || loginErrMsg.includes('operation-not-allowed')) {
          const msg = '⚠️ ยังไม่ได้เปิดใช้งาน Email/Password ใน Firebase Console: โปรดไปที่ Firebase Console > Authentication > แท็บ Sign-in method > เปิดใช้งาน Email/Password';
          setError(msg);
          throw new Error(msg);
        }

        // If user doesn't exist yet, auto-register them
        if (
          loginErrCode === 'auth/user-not-found' ||
          loginErrCode === 'auth/invalid-credential' ||
          loginErrMsg.includes('invalid-credential') ||
          loginErrMsg.includes('user-not-found')
        ) {
          console.log(`Test account ${email} not found in Firebase. Auto-creating account...`);
          const regCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
          const user = regCredential.user;
          await updateProfile(user, { displayName });

          const isBootstrappedAdmin =
            email.trim().toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() || targetRole === 'admin';
          const role: UserRole = isBootstrappedAdmin ? 'admin' : 'student';

          const newProfile: UserProfile = {
            uid: user.uid,
            email: email.trim(),
            displayName,
            role,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          try {
            await setDoc(doc(db, 'users', user.uid), newProfile);
            if (role === 'admin') {
              await setDoc(doc(db, 'admins', user.uid), {
                uid: user.uid,
                email: email.trim(),
                grantedAt: new Date().toISOString(),
              });
            }
          } catch (dbErr) {
            console.warn('Initial profile doc write check:', dbErr);
          }

          setUserProfile(newProfile);
          return;
        }

        throw loginErr;
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      const errCode = (err as { code?: string })?.code || '';

      if (errCode === 'auth/operation-not-allowed' || errMessage.includes('operation-not-allowed')) {
        setError('⚠️ ยังไม่ได้เปิดใช้งาน Email/Password ใน Firebase Console: โปรดไปที่ Firebase Console > Authentication > แท็บ Sign-in method > กด Email/Password แล้วเปิดสวิตช์ Enable');
      } else {
        setError(errMessage);
      }
      throw err;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name.trim() });

      const isBootstrappedAdmin = email.trim().toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
      const role: UserRole = isBootstrappedAdmin ? 'admin' : 'student';

      const initialProfile: UserProfile = {
        uid: user.uid,
        email: email.trim(),
        displayName: name.trim(),
        role: role,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', user.uid), initialProfile);
        if (role === 'admin') {
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: email.trim(),
            grantedAt: new Date().toISOString()
          });
        }
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.CREATE, `users/${user.uid}`);
      }

      setUserProfile(initialProfile);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : '';
      if (errMessage.includes('email-already-in-use')) {
        setError('อีเมลนี้ถูกใช้งานในระบบแล้ว');
      } else if (errMessage.includes('weak-password')) {
        setError('รหัสผ่านไม่ปลอดภัยพอ ควรมีอย่างน้อย 6 ตัวอักษร');
      } else if (errMessage.includes('invalid-email')) {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
      } else {
        setError('เกิดข้อผิดพลาดในการสมัครสมาชิก โปรดลองใหม่อีกครั้ง');
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await fetchProfile(result.user);
    } catch (err: unknown) {
      console.error('Google Sign-in error:', err);
      setError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในขณะนี้');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUserProfileName = async (newName: string) => {
    if (!currentUser || !userProfile) return;
    try {
      await updateProfile(currentUser, { displayName: newName.trim() });
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: newName.trim(),
        updatedAt: new Date().toISOString()
      });
      setUserProfile({
        ...userProfile,
        displayName: newName.trim(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  const effectiveRole: UserRole = userProfile?.role || 'student';
  const isAdmin = effectiveRole === 'admin' || currentUser?.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: effectiveRole,
        isAdmin,
        loading,
        error,
        login,
        register,
        loginOrRegisterTestAccount,
        loginWithGoogle,
        logout,
        updateUserProfileName,
        clearError,
        refreshProfile
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

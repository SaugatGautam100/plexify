'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '@/app/firebaseConfig';
import app from '@/app/firebaseConfig';

// Updated UserData interface to reflect the structure saved in phone-auth.tsx
interface UserData {
  uid: string;
  UserName: string;
  UserAddress: string;
  UserPhone: string;
  UserEmail: string;
  UserAvatar: string;
  UserCartItems: object;
  UserWishlistItems: object;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
  refreshUserData: async () => {},
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const db = getDatabase(app);
      const userRef = ref(db, `AllUsers/Users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserData({
          uid: firebaseUser.uid,
          UserName: data.UserName || '',
          UserAddress: data.UserAddress || '',
          UserPhone: data.UserPhone || '',
          UserEmail: data.UserEmail || '',
          UserAvatar: data.UserAvatar || 'https://static.vecteezy.com/system/resources/previews/020/911/732/non_2x/profile-icon-avatar-icon-user-icon-person-icon-free-png.png',
          UserCartItems: data.UserCartItems || {},
          UserWishlistItems: data.UserWishlistItems || {},
        });
        console.log('User data loaded from Firebase:', data);
      } else {
        // If data does not exist, it implies that phone-auth.tsx might not have saved it yet,
        // or the user authenticated via a different method that doesn't populate these fields.
        // We should NOT create an incomplete record here, as this could lead to race conditions
        // where incomplete data is written before the full data from phone-auth.tsx.
        // The responsibility of initial comprehensive data creation lies with phone-auth.tsx.
        console.warn('User data not found for UID:', firebaseUser.uid, ' - it might be created by phone-auth.tsx shortly or missing.');
        // Set userData to a minimal structure with available FirebaseUser info, but do not write this to the DB here.
        setUserData({
            uid: firebaseUser.uid,
            UserName: '', // Will be empty until phone-auth.tsx saves it
            UserAddress: '', // Will be empty until phone-auth.tsx saves it
            UserPhone: firebaseUser.phoneNumber || '',
            UserEmail: firebaseUser.email || '', // May be empty for phone auth users initially
            UserAvatar: 'https://static.vecteezy.com/system/resources/previews/020/911/732/non_2x/profile-icon-avatar-icon-user-icon-person-icon-free-png.png',
            UserCartItems: {},
            UserWishlistItems: {},
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
};
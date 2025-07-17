'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '@/app/firebaseConfig';
import app from '@/app/firebaseConfig';

interface UserData {
  uid: string;
  phoneNumber: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  userType: 'user' | 'seller';
  createdAt: number;
  lastLoginAt: number;
  isActive: boolean;
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
        setUserData(data);
        console.log('User data loaded from Firebase:', data);
      } else {
        // If user data doesn't exist, create it
        const newUserData: UserData = {
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          userType: 'user',
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          isActive: true,
        };
        
        await set(userRef, {
          ...newUserData,
          UserCartItems: {},
          UserWishlistItems: {}
        });
        
        setUserData(newUserData);
        console.log('New user data created:', newUserData);
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
      // Update user's last activity before logout
      if (user) {
        const db = getDatabase(app);
        const userRef = ref(db, `AllUsers/Users/${user.uid}/lastLoginAt`);
        await set(userRef, Date.now());
      }
      
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
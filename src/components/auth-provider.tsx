"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Your Firebase app instance
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // It's good practice to re-affirm the cookie if Firebase confirms auth
        Cookies.set('isAuthenticated', 'true', { 
          expires: 7, 
          secure: process.env.NODE_ENV === 'production',
          // sameSite: 'strict' // Consider adding for CSRF protection
        });
      } else {
        setUser(null);
        Cookies.remove('isAuthenticated');
        // Optional: redirect to login if not on a public page and user is signed out.
        // Example: if (!['/login', '/signup'].includes(window.location.pathname)) {
        //   router.push('/login');
        // }
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, router]); // Dependencies for the effect

  // This secondary effect can help improve perceived performance on initial load
  // by checking the cookie value before Firebase SDK fully initializes.
  // However, onAuthStateChanged is the source of truth.
  useEffect(() => {
    if (loading) { // Only run if Firebase is still initializing
      const isAuthenticatedCookie = Cookies.get('isAuthenticated');
      if (isAuthenticatedCookie === 'true' && !user) {
        // Potentially set a temporary user state or adjust loading UI
        // This is an optimistic update, real state comes from onAuthStateChanged
        console.log("Auth cookie found, waiting for Firebase confirmation...");
      }
    }
  }, [loading, user]);


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* You can show a global loader here based on the loading state */}
      {/* For example: {loading ? <GlobalSpinner /> : children} */}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
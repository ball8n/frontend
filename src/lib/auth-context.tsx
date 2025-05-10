"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from './firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);

        // Optional: set up listener for token refresh
        user.getIdTokenResult().then((result) => {
          const expiresAt = new Date(result.expirationTime).getTime();
          const now = Date.now();
          const timeout = expiresAt - now - 60_000; // refresh 1 min before expiry

          setTimeout(async () => {
            const refreshed = await user.getIdToken(true);
            setToken(refreshed);
          }, timeout);
        });
      } else {
        setToken(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useFirebaseAuth = () => useContext(AuthContext); 
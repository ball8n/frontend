"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Cookies from 'js-cookie';
import { getAuth, signInWithEmailAndPassword, AuthError, setPersistence, browserLocalPersistence } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const auth = getAuth(app);

    try {
      // Set persistence to LOCAL (persists even after browser restart)
      await setPersistence(auth, browserLocalPersistence);
      
      // Sign in user
      await signInWithEmailAndPassword(auth, email, password);
      
      // Set cookie for middleware protection
      Cookies.set('isAuthenticated', 'true', { 
        expires: 7,
        sameSite: 'strict', // Helps prevent CSRF
        secure: process.env.NODE_ENV === 'production' // HTTPS only in production
      }); // Expires in 7 days

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      const firebaseError = error as AuthError;
      console.error("Firebase Auth Error:", firebaseError.code, firebaseError.message);

      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError("Invalid email or password.");
          break;
        case 'auth/invalid-email':
          setError("Please enter a valid email address.");
          break;
        default:
          setError("An unexpected error occurred during login. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
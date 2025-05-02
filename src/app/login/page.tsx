"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/login-form";
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = Cookies.get('isAuthenticated');
    
    if (isAuthenticated === "true") {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-black-900 dark:to-black-800">
      <div className="w-full max-w-md p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Test Analysis Dashboard</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 
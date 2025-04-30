"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirects users from the home page to the login page and displays a loading message during the transition.
 *
 * @returns A loading UI while redirecting to the login page.
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p className="mt-2 text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
} 
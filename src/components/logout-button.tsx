"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 * Renders a logout button that clears authentication data and redirects to the login page.
 *
 * Removes the `isAuthenticated` flag from both cookies and local storage before navigating to `/login`.
 *
 * @param variant - Optional button style variant.
 * @param size - Optional button size.
 * @param className - Optional additional CSS class names.
 */
export default function LogoutButton({ 
  variant = "ghost", 
  size = "sm", 
  className = "" 
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication data
    Cookies.remove('isAuthenticated');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout}
      className={className}
    >
      Logout
    </Button>
  );
} 
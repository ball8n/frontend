"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Users, 
  FileText,
  Menu,
  X,
  Package,
  FolderTree,
  FlaskConical,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import LogoutButton from "@/components/logout-button";

const navItems = [
  {
    name: "Products",
    href: "/products",
    icon: Package
  },
  {
    name: "Test Groups",
    href: "/test-groups",
    icon: FolderTree
  },
  {
    name: "Tests",
    href: "/tests",
    icon: FlaskConical
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings
  },
  {
    name: "demo",
    href: "/reports",
    icon: Settings
  }
];

/**
 * Renders a responsive navigation sidebar with navigation links and a logout option.
 *
 * The sidebar highlights the active route, adapts to mobile and desktop layouts, and includes a logout button at the bottom.
 */
export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r bg-background transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center font-bold text-xl">
            Test Analytics
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4 pt-6 flex-grow">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-5 w-5" />
            <LogoutButton variant="ghost" className="m-0 p-0 h-auto font-medium" />
          </div>
        </div>
      </aside>
    </>
  );
} 
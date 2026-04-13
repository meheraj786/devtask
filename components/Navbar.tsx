"use client";

import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Briefcase,
  LogOut,
  LogIn,
  Terminal,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "./FirebaseProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const logout = () => signOut(auth);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Learning", href: "/learning", icon: BookOpen },
    { name: "Projects", href: "/projects", icon: Briefcase },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2 border-bottom border-border">
          <Terminal className="w-6 h-6 text-primary" />
          <span className="font-mono font-bold text-xl tracking-tighter">
            DEVTASK
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-xs font-mono">
                    {user.displayName?.[0] || "U"}
                  </span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">
                    {user.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={() => router.push("/login")}
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <span className="font-mono font-bold text-lg tracking-tighter">
            DEVTASK
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-[65px] bg-background z-40 p-6 flex flex-col gap-6"
          >
            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 text-lg font-medium p-2 rounded-md",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-border">
              {user ? (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  onClick={() => router.push("/login")}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

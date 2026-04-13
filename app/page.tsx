"use client";

import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/FirebaseProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  CheckSquare,
  BookOpen,
  Briefcase,
  ArrowRight,
  Plus,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-8 h-8 text-primary animate-pulse" />
          <p className="font-mono text-sm animate-pulse">BOOTING SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
        <Navbar />

        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <header className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-mono text-sm">
                <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded">
                  v1.0.0
                </span>
                <span className="opacity-50">/</span>
                <span>DASHBOARD</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Welcome back,{" "}
                <span className="text-primary">
                  {user?.displayName?.split(" ")[0] || "Developer"}
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Your personal command center for tasks, learning, and projects.
                Stay focused, stay productive.
              </p>
            </header>

            {/* Quick Stats/Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium font-mono">
                      NORMAL TASKS
                    </CardTitle>
                    <CheckSquare className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Quick Capture</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Simple to-dos and reminders.
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full mt-4 justify-between group"
                      onClick={() => router.push("/tasks")}
                    >
                      Manage Tasks
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium font-mono">
                      LEARNING PATHS
                    </CardTitle>
                    <BookOpen className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Skill Growth</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Track topics and study resources.
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full mt-4 justify-between group"
                      onClick={() => router.push("/learning")}
                    >
                      View Topics
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium font-mono">
                      PROJECTS
                    </CardTitle>
                    <Briefcase className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Development</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Milestones and due dates.
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full mt-4 justify-between group"
                      onClick={() => router.push("/projects")}
                    >
                      Go to Projects
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Activity / System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  System Status
                </h2>
                <div className="border border-border rounded-lg p-6 bg-card/30 space-y-4 font-mono text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">AUTH_STATE:</span>
                    <span
                      className={user ? "text-green-500" : "text-yellow-500"}
                    >
                      {user ? "AUTHENTICATED" : "GUEST_MODE"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      DATABASE_SYNC:
                    </span>
                    <span className="text-green-500">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      OFFLINE_PERSISTENCE:
                    </span>
                    <span className="text-green-500">ENABLED</span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Welcome to DevTask Terminal. All systems operational.
                      Manage your workflow with precision.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Quick Start
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {!user ? (
                    <div className="p-8 border border-dashed border-border rounded-lg text-center space-y-4">
                      <p className="text-muted-foreground">
                        Login to start syncing your tasks across devices.
                      </p>
                      <Button variant="outline" className="font-mono">
                        INITIALIZE_AUTH
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm">
                        Select a module from the sidebar to begin your session.
                      </p>
                      <div className="p-4 bg-primary/5 border border-primary/10 rounded-md">
                        <p className="text-sm italic">
                          The best way to get something done is to begin.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

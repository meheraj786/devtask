"use client";

import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/FirebaseProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckSquare,
  BookOpen,
  Briefcase,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type DashboardPreviewItem = {
  id: string;
  title: string;
  description?: string;
  isComplete?: boolean;
  createdAt?: Timestamp | { toMillis?: () => number } | number;
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [counts, setCounts] = useState({ tasks: 0, projects: 0, topics: 0 });
  const [previewTasks, setPreviewTasks] = useState<DashboardPreviewItem[]>([]);
  const [previewTopics, setPreviewTopics] = useState<DashboardPreviewItem[]>(
    [],
  );
  const [previewProjects, setPreviewProjects] = useState<
    DashboardPreviewItem[]
  >([]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const [
          taskSnap,
          projectSnap,
          topicSnap,
          taskDocs,
          projectDocs,
          topicDocs,
        ] = await Promise.all([
          getCountFromServer(
            query(
              collection(db, "normal_tasks"),
              where("userId", "==", user.uid),
            ),
          ),
          getCountFromServer(
            query(collection(db, "projects"), where("userId", "==", user.uid)),
          ),
          getCountFromServer(
            query(
              collection(db, "learning_topics"),
              where("userId", "==", user.uid),
            ),
          ),
          getDocs(
            query(
              collection(db, "normal_tasks"),
              where("userId", "==", user.uid),
              limit(3),
            ),
          ),
          getDocs(
            query(
              collection(db, "projects"),
              where("userId", "==", user.uid),
              limit(2),
            ),
          ),
          getDocs(
            query(
              collection(db, "learning_topics"),
              where("userId", "==", user.uid),
              limit(2),
            ),
          ),
        ]);

        const tasks = taskDocs.docs
          .map((doc) => ({
            ...(doc.data() as DashboardPreviewItem),
            id: doc.id,
          }))
          .sort((a, b) => {
            const aTime =
              typeof a.createdAt === "number"
                ? a.createdAt
                : typeof a.createdAt === "object" && a.createdAt?.toMillis
                  ? a.createdAt.toMillis()
                  : 0;
            const bTime =
              typeof b.createdAt === "number"
                ? b.createdAt
                : typeof b.createdAt === "object" && b.createdAt?.toMillis
                  ? b.createdAt.toMillis()
                  : 0;
            return bTime - aTime;
          });

        const projects = projectDocs.docs
          .map((doc) => ({
            ...(doc.data() as DashboardPreviewItem),
            id: doc.id,
          }))
          .sort((a, b) => {
            const aTime =
              typeof a.createdAt === "number"
                ? a.createdAt
                : typeof a.createdAt === "object" && a.createdAt?.toMillis
                  ? a.createdAt.toMillis()
                  : 0;
            const bTime =
              typeof b.createdAt === "number"
                ? b.createdAt
                : typeof b.createdAt === "object" && b.createdAt?.toMillis
                  ? b.createdAt.toMillis()
                  : 0;
            return bTime - aTime;
          });

        const topics = topicDocs.docs
          .map((doc) => ({
            ...(doc.data() as DashboardPreviewItem),
            id: doc.id,
          }))
          .sort((a, b) => {
            const aTime =
              typeof a.createdAt === "number"
                ? a.createdAt
                : typeof a.createdAt === "object" && a.createdAt?.toMillis
                  ? a.createdAt.toMillis()
                  : 0;
            const bTime =
              typeof b.createdAt === "number"
                ? b.createdAt
                : typeof b.createdAt === "object" && b.createdAt?.toMillis
                  ? b.createdAt.toMillis()
                  : 0;
            return bTime - aTime;
          });

        setCounts({
          tasks: taskSnap.data().count,
          projects: projectSnap.data().count,
          topics: topicSnap.data().count,
        });
        setPreviewTasks(tasks);
        setPreviewProjects(projects);
        setPreviewTopics(topics);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchDashboardData();
  }, [user]);

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

            {/* Overview */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-border bg-card/50 backdrop-blur-sm transition-colors">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-mono">
                    Tasks Overview
                  </CardTitle>
                  <CheckSquare className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{counts.tasks}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Active tasks in your queue, ready for capture.
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 justify-between"
                    onClick={() => router.push("/tasks")}
                  >
                    Open Tasks
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 backdrop-blur-sm transition-colors">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-mono">
                    Learning Overview
                  </CardTitle>
                  <BookOpen className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{counts.topics}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Learning topics and milestones you’re tracking.
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 justify-between"
                    onClick={() => router.push("/learning")}
                  >
                    View Learning
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 backdrop-blur-sm transition-colors">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-mono">
                    Projects Overview
                  </CardTitle>
                  <Briefcase className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{counts.projects}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ongoing projects and milestones that need your focus.
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full mt-4 justify-between"
                    onClick={() => router.push("/projects")}
                  >
                    Open Projects
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Preview cards */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="border-border bg-card/50 backdrop-blur-sm transition-colors">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-mono">
                    Latest Tasks
                  </CardTitle>
                  <CheckSquare className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {previewTasks.length > 0 ? (
                    previewTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-lg border border-border px-4 py-3 bg-background/80"
                      >
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.isComplete ? "Completed" : "Pending"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tasks yet — create one in the Tasks section.
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => router.push("/tasks")}
                  >
                    See all tasks
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 backdrop-blur-sm transition-colors">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-mono">
                    Recent Learning
                  </CardTitle>
                  <BookOpen className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {previewTopics.length > 0 ? (
                    previewTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="rounded-lg border border-border px-4 py-3 bg-background/80"
                      >
                        <p className="font-medium text-sm">{topic.title}</p>
                        <p className="text-xs line-clamp-3 text-muted-foreground mt-1">
                          {topic.description || "No description added yet."}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No learning topics yet — add your next subject.
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => router.push("/learning")}
                  >
                    View learning
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 backdrop-blur-sm transition-colors">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium font-mono">
                    Active Projects
                  </CardTitle>
                  <Briefcase className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {previewProjects.length > 0 ? (
                    previewProjects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-lg border border-border px-4 py-3 bg-background/80"
                      >
                        <p className="font-medium text-sm">{project.title}</p>
                        <p className="text-xs line-clamp-3 text-muted-foreground mt-1">
                          {project.description || "No description added yet."}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No projects yet — kick off a new one now.
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                    onClick={() => router.push("/projects")}
                  >
                    View projects
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

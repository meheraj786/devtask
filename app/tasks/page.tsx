"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/FirebaseProvider";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface Task {
  id: string;
  title: string;
  isComplete: boolean;
  userId: string;
  createdAt: any;
}

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "normal_tasks"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() ?? 0;
            const bTime = b.createdAt?.toMillis?.() ?? 0;
            return bTime - aTime;
          }) as Task[];
        setTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks. Check permissions.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "normal_tasks"), {
        userId: user.uid,
        title: newTask.trim(),
        isComplete: false,
        createdAt: serverTimestamp(),
      });
      setNewTask("");
      toast.success("Task added to queue.");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "normal_tasks", taskId), {
        isComplete: !currentStatus,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "normal_tasks", taskId));
      toast.success("Task purged from system.");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  if (authLoading) return null;

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />

        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            <header className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-mono text-xs">
                <Terminal className="w-3 h-3" />
                <span>SYSTEM.TASKS.NORMAL</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Normal Tasks
              </h1>
              <p className="text-muted-foreground">
                Quick capture for your daily operations.
              </p>
            </header>

            {/* Add Task Form */}
            <form onSubmit={addTask} className="flex gap-2">
              <Input
                placeholder="Enter new task description..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="font-mono bg-card border-border focus-visible:ring-primary"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting || !newTask.trim()}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                ADD_TASK
              </Button>
            </form>

            {/* Task List */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center py-20 gap-4 opacity-50">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="font-mono text-xs">FETCHING_DATA...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground font-mono text-sm">
                    NO_TASKS_FOUND
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                    >
                      <Card
                        className={cn(
                          "border-border bg-card/50 transition-all duration-200 hover:border-primary/30",
                          task.isComplete && "opacity-60 grayscale-[0.5]",
                        )}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <Checkbox
                            checked={task.isComplete}
                            onCheckedChange={() =>
                              toggleTask(task.id, task.isComplete)
                            }
                            className="border-primary data-[state=checked]:bg-primary"
                          />
                          <span
                            className={cn(
                              "flex-1 font-mono text-sm",
                              task.isComplete &&
                                "line-through text-muted-foreground",
                            )}
                          >
                            {task.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </main>
      </div>{" "}
    </ProtectedRoute>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

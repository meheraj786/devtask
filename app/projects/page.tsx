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
  Timestamp,
} from "firebase/firestore";
import {
  Plus,
  Trash2,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Terminal,
  Save,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import Footer from "@/components/Footer";

interface Project {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: any;
}

interface ProjectTask {
  id: string;
  title: string;
  isComplete: boolean;
  projectId: string;
  dueDate?: any;
  createdAt: any;
}

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [projectDesc, setProjectDesc] = useState("");

  // Fetch Projects
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "projects"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];

        projectsData.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });

        setProjects(projectsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch Tasks for selected project
  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }

    const q = query(
      collection(db, "projects", selectedProject.id, "tasks"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectTask[];
      setTasks(tasksData);
    });

    setProjectDesc(selectedProject.description || "");

    return () => unsubscribe();
  }, [selectedProject]);

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "projects"), {
        userId: user.uid,
        title: newProjectTitle.trim(),
        description: "",
        createdAt: serverTimestamp(),
      });
      setNewProjectTitle("");
      toast.success("Project initialized.");
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "projects", projectId));
      if (selectedProject?.id === projectId) setSelectedProject(null);
      toast.success("Project archived.");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project.");
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProject) return;

    try {
      await addDoc(collection(db, "projects", selectedProject.id, "tasks"), {
        projectId: selectedProject.id,
        title: newTaskTitle.trim(),
        isComplete: false,
        dueDate: newTaskDate ? Timestamp.fromDate(newTaskDate) : null,
        createdAt: serverTimestamp(),
      });
      setNewTaskTitle("");
      setNewTaskDate(undefined);
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task.");
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!selectedProject) return;
    try {
      await updateDoc(
        doc(db, "projects", selectedProject.id, "tasks", taskId),
        {
          isComplete: !currentStatus,
        },
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!selectedProject) return;
    try {
      await deleteDoc(doc(db, "projects", selectedProject.id, "tasks", taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const saveDescription = async () => {
    if (!selectedProject) return;
    try {
      await updateDoc(doc(db, "projects", selectedProject.id), {
        description: projectDesc,
      });
      setIsEditingDesc(false);
      toast.success("Project documentation updated.");
    } catch (error) {
      console.error("Error saving description:", error);
      toast.error("Failed to save documentation.");
    }
  };

  const getDueDateStatus = (dueDate: any) => {
    if (!dueDate) return null;
    const date =
      dueDate instanceof Timestamp ? dueDate.toDate() : new Date(dueDate);
    if (isPast(date) && !isToday(date)) return "text-destructive";
    if (isToday(date)) return "text-yellow-500";
    return "text-muted-foreground";
  };

  if (authLoading) return null;

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />

        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {!selectedProject ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <header className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-mono text-xs">
                      <Terminal className="w-3 h-3" />
                      <span>SYSTEM.PROJECTS.ACTIVE</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Projects
                    </h1>
                    <p className="text-muted-foreground">
                      Manage complex development cycles and milestones.
                    </p>
                  </header>

                  <form onSubmit={addProject} className="flex gap-2">
                    <Input
                      placeholder="Project Name (e.g. E-commerce API, Portfolio v2)"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      className="font-mono bg-card border-border"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting || !newProjectTitle.trim()}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      INIT_PROJECT
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                      <div className="col-span-full flex flex-col items-center py-20 gap-4 opacity-50">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="font-mono text-xs">
                          SCANNING_PROJECTS...
                        </p>
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="col-span-full text-center py-20 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground font-mono text-sm">
                          NO_PROJECTS_FOUND
                        </p>
                      </div>
                    ) : (
                      projects.map((project) => (
                        <Card
                          key={project.id}
                          className="group border-border bg-card/50 hover:border-primary/50 cursor-pointer transition-all duration-200"
                          onClick={() => setSelectedProject(project)}
                        >
                          <CardHeader className="p-5">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <CardTitle className="text-lg font-mono group-hover:text-primary transition-colors">
                                  {project.title}
                                </CardTitle>
                                <CardDescription className="text-xs font-mono opacity-50">
                                  ID: {project.id.slice(0, 8)}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => deleteProject(project.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="px-5 pb-5 flex justify-between items-center">
                            <span className="text-xs text-muted-foreground font-mono">
                              STATUS: IN_DEVELOPMENT
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedProject(null)}
                    className="font-mono text-xs hover:text-primary p-0 h-auto"
                  >
                    <ArrowLeft className="w-3 h-3 mr-2" />
                    BACK_TO_ROOT
                  </Button>

                  <header className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded border border-primary/20">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight">
                        {selectedProject.title}
                      </h1>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-mono text-primary flex items-center gap-2">
                          <Terminal className="w-3 h-3" />
                          PROJECT_DOCUMENTATION
                        </h3>
                        {!isEditingDesc ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingDesc(true)}
                            className="text-xs font-mono h-7"
                          >
                            EDIT_DOCS
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingDesc(false)}
                              className="text-xs font-mono h-7"
                            >
                              CANCEL
                            </Button>
                            <Button
                              size="sm"
                              onClick={saveDescription}
                              className="text-xs font-mono h-7"
                            >
                              <Save className="w-3 h-3 mr-2" />
                              SAVE_DOCS
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditingDesc ? (
                        <Textarea
                          value={projectDesc}
                          onChange={(e) => setProjectDesc(e.target.value)}
                          placeholder="Add project goals, tech stack, or links here..."
                          className="min-h-[150px] font-mono text-sm bg-card border-border"
                        />
                      ) : (
                        <div className="p-4 bg-card/30 border border-border rounded-md min-h-[100px] whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                          {selectedProject.description ||
                            "No documentation added yet."}
                        </div>
                      )}
                    </div>
                  </header>

                  <section className="space-y-4">
                    <h3 className="text-sm font-mono text-primary flex items-center gap-2">
                      <Terminal className="w-3 h-3" />
                      PROJECT_MILESTONES
                    </h3>

                    <form
                      onSubmit={addTask}
                      className="flex flex-col md:flex-row gap-2"
                    >
                      <Input
                        placeholder="Add a milestone or task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="font-mono bg-card border-border flex-1"
                      />
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger>
                            <Button
                              variant="outline"
                              className={cn(
                                "font-mono text-xs h-10 px-3",
                                !newTaskDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {newTaskDate
                                ? format(newTaskDate, "PPP")
                                : "SET_DUE_DATE"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                              mode="single"
                              selected={newTaskDate}
                              onSelect={setNewTaskDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Button type="submit" disabled={!newTaskTitle.trim()}>
                          <Plus className="w-4 h-4 mr-2" />
                          ADD
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 p-3 border border-border rounded-md bg-card/20 transition-all",
                            task.isComplete && "opacity-50",
                          )}
                        >
                          <Checkbox
                            checked={task.isComplete}
                            onCheckedChange={() =>
                              toggleTask(task.id, task.isComplete)
                            }
                          />
                          <div className="flex-1 flex flex-col">
                            <span
                              className={cn(
                                "font-mono text-sm",
                                task.isComplete && "line-through",
                              )}
                            >
                              {task.title}
                            </span>
                            {task.dueDate && (
                              <div
                                className={cn(
                                  "flex items-center gap-1 text-[10px] font-mono mt-1",
                                  getDueDateStatus(task.dueDate),
                                )}
                              >
                                <Clock className="w-3 h-3" />
                                DUE:{" "}
                                {format(
                                  task.dueDate instanceof Timestamp
                                    ? task.dueDate.toDate()
                                    : new Date(task.dueDate),
                                  "PPP",
                                )}
                                {isPast(
                                  task.dueDate instanceof Timestamp
                                    ? task.dueDate.toDate()
                                    : new Date(task.dueDate),
                                ) &&
                                  !isToday(
                                    task.dueDate instanceof Timestamp
                                      ? task.dueDate.toDate()
                                      : new Date(task.dueDate),
                                  ) &&
                                  !task.isComplete && (
                                    <span className="flex items-center gap-1 ml-2 text-destructive font-bold">
                                      <AlertCircle className="w-3 h-3" />
                                      OVERDUE
                                    </span>
                                  )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <p className="text-center py-10 text-muted-foreground font-mono text-xs border border-dashed border-border rounded-md">
                          NO_MILESTONES_DEFINED
                        </p>
                      )}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Footer />
        </main>
      </div>
    </ProtectedRoute>
  );
}

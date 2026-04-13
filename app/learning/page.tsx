"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/FirebaseProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
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
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Terminal,
  ExternalLink,
  Save,
  CheckCircle2,
  Circle,
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
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";

interface Topic {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: any;
}

interface SubTask {
  id: string;
  title: string;
  isComplete: boolean;
  topicId: string;
  createdAt: any;
}

export default function LearningPage() {
  const { user, loading: authLoading } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [topicDesc, setTopicDesc] = useState("");

  // Fetch Topics
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "learning_topics"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const topicsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Topic[];

        topicsData.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });

        setTopics(topicsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching topics:", error);
        toast.error("Failed to load topics.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch SubTasks for selected topic
  useEffect(() => {
    if (!selectedTopic) {
      setSubTasks([]);
      return;
    }

    const q = query(
      collection(db, "learning_topics", selectedTopic.id, "tasks"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SubTask[];
      setSubTasks(tasksData);
    });

    setTopicDesc(selectedTopic.description || "");

    return () => unsubscribe();
  }, [selectedTopic]);

  const addTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "learning_topics"), {
        userId: user.uid,
        title: newTopicTitle.trim(),
        description: "",
        createdAt: serverTimestamp(),
      });
      setNewTopicTitle("");
      toast.success("Learning topic initialized.");
    } catch (error) {
      console.error("Error adding topic:", error);
      toast.error("Failed to add topic.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "learning_topics", topicId));
      if (selectedTopic?.id === topicId) setSelectedTopic(null);
      toast.success("Topic purged.");
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("Failed to delete topic.");
    }
  };

  const addSubTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim() || !selectedTopic) return;

    try {
      await addDoc(
        collection(db, "learning_topics", selectedTopic.id, "tasks"),
        {
          topicId: selectedTopic.id,
          title: newSubTaskTitle.trim(),
          isComplete: false,
          createdAt: serverTimestamp(),
        },
      );
      setNewSubTaskTitle("");
    } catch (error) {
      console.error("Error adding subtask:", error);
      toast.error("Failed to add subtask.");
    }
  };

  const toggleSubTask = async (taskId: string, currentStatus: boolean) => {
    if (!selectedTopic) return;
    try {
      await updateDoc(
        doc(db, "learning_topics", selectedTopic.id, "tasks", taskId),
        {
          isComplete: !currentStatus,
        },
      );
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const deleteSubTask = async (taskId: string) => {
    if (!selectedTopic) return;
    try {
      await deleteDoc(
        doc(db, "learning_topics", selectedTopic.id, "tasks", taskId),
      );
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  const saveDescription = async () => {
    if (!selectedTopic) return;
    try {
      await updateDoc(doc(db, "learning_topics", selectedTopic.id), {
        description: topicDesc,
      });
      setIsEditingDesc(false);
      toast.success("Resources updated.");
    } catch (error) {
      console.error("Error saving description:", error);
      toast.error("Failed to save resources.");
    }
  };

  if (authLoading) return null;

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />

        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {!selectedTopic ? (
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
                      <span>SYSTEM.LEARNING.MODULES</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Learning Topics
                    </h1>
                    <p className="text-muted-foreground">
                      Master new skills by breaking them down into manageable
                      steps.
                    </p>
                  </header>

                  <form onSubmit={addTopic} className="flex gap-2">
                    <Input
                      placeholder="What do you want to learn? (e.g. Rust, Kubernetes)"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      className="font-mono bg-card border-border"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting || !newTopicTitle.trim()}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      INIT_TOPIC
                    </Button>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                      <div className="col-span-full flex flex-col items-center py-20 gap-4 opacity-50">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="font-mono text-xs">SCANNING_MODULES...</p>
                      </div>
                    ) : topics.length === 0 ? (
                      <div className="col-span-full text-center py-20 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground font-mono text-sm">
                          NO_TOPICS_INITIALIZED
                        </p>
                      </div>
                    ) : (
                      topics.map((topic) => (
                        <Card
                          key={topic.id}
                          className="group border-border bg-card/50 hover:border-primary/50 cursor-pointer transition-all duration-200"
                          onClick={() => setSelectedTopic(topic)}
                        >
                          <CardHeader className="p-5">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <CardTitle className="text-lg font-mono group-hover:text-primary transition-colors">
                                  {topic.title}
                                </CardTitle>
                                <CardDescription className="text-xs font-mono opacity-50">
                                  ID: {topic.id.slice(0, 8)}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => deleteTopic(topic.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="px-5 pb-5 flex justify-between items-center">
                            <span className="text-xs text-muted-foreground font-mono">
                              STATUS: ACTIVE
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
                    onClick={() => setSelectedTopic(null)}
                    className="font-mono text-xs hover:text-primary p-0 h-auto"
                  >
                    <ArrowLeft className="w-3 h-3 mr-2" />
                    BACK_TO_ROOT
                  </Button>

                  <header className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded border border-primary/20">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight">
                        {selectedTopic.title}
                      </h1>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-mono text-primary flex items-center gap-2">
                          <Terminal className="w-3 h-3" />
                          RESOURCES_AND_NOTES
                        </h3>
                        {!isEditingDesc ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingDesc(true)}
                            className="text-xs font-mono h-7"
                          >
                            EDIT_RESOURCES
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
                              SAVE_CHANGES
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditingDesc ? (
                        <Textarea
                          value={topicDesc}
                          onChange={(e) => setTopicDesc(e.target.value)}
                          placeholder="Add links, resources, or study notes here..."
                          className="min-h-[150px] font-mono text-sm bg-card border-border"
                        />
                      ) : (
                        <div className="p-4 bg-card/30 border border-border rounded-md min-h-[100px] whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                          {selectedTopic.description ||
                            "No resources added yet. Click edit to add links or notes."}
                        </div>
                      )}
                    </div>
                  </header>

                  <section className="space-y-4">
                    <h3 className="text-sm font-mono text-primary flex items-center gap-2">
                      <Terminal className="w-3 h-3" />
                      CURRICULUM_TASKS
                    </h3>

                    <form onSubmit={addSubTask} className="flex gap-2">
                      <Input
                        placeholder="Add a sub-task or milestone..."
                        value={newSubTaskTitle}
                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                        className="font-mono bg-card border-border"
                      />
                      <Button type="submit" disabled={!newSubTaskTitle.trim()}>
                        <Plus className="w-4 h-4 mr-2" />
                        ADD_STEP
                      </Button>
                    </form>

                    <div className="space-y-2">
                      {subTasks.map((task) => (
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
                              toggleSubTask(task.id, task.isComplete)
                            }
                          />
                          <span
                            className={cn(
                              "flex-1 font-mono text-sm",
                              task.isComplete && "line-through",
                            )}
                          >
                            {task.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSubTask(task.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {subTasks.length === 0 && (
                        <p className="text-center py-10 text-muted-foreground font-mono text-xs border border-dashed border-border rounded-md">
                          NO_STEPS_DEFINED
                        </p>
                      )}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/FirebaseProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      if (credential.user && name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      toast.success("Account created successfully.");
      router.replace("/");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in with Google.");
      router.replace("/");
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
        <div className="space-y-4 text-center">
          <p className="text-sm font-mono uppercase tracking-[0.35em] text-primary">
            DevTask Auth
          </p>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Register to save tasks, learning topics, and projects with secure
            access.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 mt-8">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full name</label>
            <Input
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>OR</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

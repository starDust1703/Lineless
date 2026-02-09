"use client";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="flex flex-col gap-6 rounded-xl bg-(--card) p-6 shadow transition hover:shadow-lg">
          <div>
            <h3 className="mb-1 text-2xl font-semibold">Login</h3>
            <p className="text-sm text-(--muted-foreground)">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-1 -my-1 border-2 border-(--muted-foreground)/40 px-3 rounded focus:border-(--ring) focus:border-2"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-1 -my-1 border-2 border-(--muted-foreground)/40 px-3 rounded focus:border-(--ring) focus:border-2"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" className={`px-4 py-2 rounded-md bg-(--foreground) text-(--background) font-bold text-md hover:opacity-80 transition ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`} disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
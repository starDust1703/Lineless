"use client";
import ClickSpark from "../../../components/ClickSpark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { createClient } from "../../../lib/supabase/client";
import { cn } from "../../../lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthClientGuard from "../AuthClientGuard";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/sign-up-success");
    } catch (error) {
      setError(error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('profiles').insert({
        id: user.id,
        name
      });
    }
  };

  return (
    <ClickSpark
      sparkColor='#fff'
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <AuthClientGuard />
      <div className="flex min-h-svh w-full bg items-center justify-center p-6 md:p-10">
        <div className={cn("flex flex-col w-80 gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign up</CardTitle>
              <CardDescription>Create a new account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <input
                      id="name"
                      type="text"
                      pattern="[A-Za-z\s]+"
                      title="Only Latin letters allowed"
                      placeholder="Alice"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="p-1 -my-1 border-2 border-(--muted-foreground)/40 px-3 rounded outline-none focus:border-(--ring) focus:border-2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <input
                      id="email"
                      type="email"
                      title="Enter a valid email address"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="p-1 -my-1 border-2 border-(--muted-foreground)/40 px-3 rounded outline-none focus:border-(--ring) focus:border-2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <input
                      id="password"
                      type="password"
                      title="Password must be at least 6 characters"
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="p-1 -my-1 border-2 border-(--muted-foreground)/40 px-3 rounded outline-none focus:border-(--ring) focus:border-2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Repeat Password</Label>
                    <input
                      id="repeat-password"
                      type="password"
                      title="Must match the password above"
                      placeholder="Password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="p-1 -my-1 border-2 border-(--muted-foreground)/40 px-3 rounded outline-none focus:border-(--ring) focus:border-2"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button type="submit" className="px-4 py-2 rounded-md bg-(--foreground) text-(--background) font-bold text-md cursor-pointer hover:opacity-80 transition" disabled={isLoading}>
                    {isLoading ? "Creating an account..." : "Sign up"}
                  </button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClickSpark>
  )
}

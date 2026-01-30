"use client";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { usePathname, useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import { createClient } from "../lib/supabase/client";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const scrollToFeatures = () => {
    if (pathname !== "/") {
      router.push("/#features");
    } else {
      document
        .getElementById("features")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const [user, setUser] = useState(null);
  const fetchUser = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    setUser(data.session.user);
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-(--border)  backdrop-blur bg-(--background)/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-(--foreground)"
        >
          LineLess
        </Link>

        <nav className="flex items-center gap-6 text-sm text-(--muted-foreground)">
          <ThemeSwitcher />
          <button onClick={scrollToFeatures} className="hover:text-(--foreground) cursor-pointer">
            Features
          </button>
          <Link href="/guide" className="hover:text-(--foreground)">
            Guide
          </Link>

          {user && <AuthButton user={user} />}
        </nav>
      </div>
    </header>
  );
}

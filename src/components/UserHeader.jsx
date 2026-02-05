"use client";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { useEffect, useState } from "react";
import { ScanQrCode } from "lucide-react";
import Dropdown from "./ui/DropDown";

export default function UserHeader({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  const scrollToFeatures = () => {
    if (pathname !== "/") {
      router.push("/#features");
    } else {
      document
        .getElementById("features")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const fetchUser = async () => {
    const supabase = createClient();

    const { data: { name, is_admin } } = await supabase
      .from('profiles')
      .select('name, is_admin')
      .eq('id', user?.id)
      .single();
    if (is_admin) setIsAdmin(true);
    setName(name);
  }
  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) router.replace('/login');
      });

    return () => subscription.unsubscribe();
  }, []);

  const openCam = () => {
    router.push("/qr-scan");
  }

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
          <button className="cursor-pointer hover:text-(--foreground)" onClick={() => openCam()}>
            <ScanQrCode size={18} />
          </button>
          <ThemeSwitcher />
          <button onClick={scrollToFeatures} className="hover:text-(--foreground) cursor-pointer">
            Features
          </button>
          <Link href="/guide" className="hover:text-(--foreground)">
            Guide
          </Link>

          <Dropdown
            trigger={<button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--muted) text-sm font-semibold hover:bg-(--primary)/10 outline-none cursor-pointer"
            >
              {name && name[0]?.toUpperCase()}
            </button>}
            items={isAdmin ? [
              { label: name },
              {
                label: (pathname == '/dashboard') ? "Admin" : "Dashboard", onClick: () => router.push(`${pathname == '/dashboard' ? '/admin' : '/dashboard'}`)
              },
              { label: "Log out", onClick: handleLogout },
            ] :
              [{ label: name },
              { label: "Log out", onClick: handleLogout },]}
          />
        </nav>
      </div>
    </header>
  );
}

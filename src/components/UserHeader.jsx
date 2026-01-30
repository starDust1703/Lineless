"use client";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { useEffect, useState } from "react";
import { ScanQrCode } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function UserHeader({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");
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

    const { data: { name } } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user?.id)
      .single();
    setName(name);
  }
  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setName(null);
    router.refresh();
  };
  const openCam = () => {

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--muted) text-sm font-semibold hover:bg-(--primary)/10 outline-none cursor-pointer"
              >
                {name && name[0]?.toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-content backdrop-blur-xl absolute top-2 -right-5 border-(--muted-foreground)/30" align="start">
              <DropdownMenuGroup className="flex flex-col gap-1">
                <DropdownMenuItem className="flex gap-2 cursor-pointer hover:bg-(--muted)/70">
                  <span>{name}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex gap-2 cursor-pointer hover:bg-(--muted)/70">
                  <button
                    onClick={() => handleLogout()}
                    className="cursor-pointer">
                    Log Out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}

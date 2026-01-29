import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link'
import { createClient } from "../lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function AuthButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: { name } } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();
    setName(name);
  }
  useEffect(() => {
    fetchUser();
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setName(null);
    setOpen(false);
    router.refresh();
  };

  return name ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--muted) text-sm font-semibold hover:bg-(--primary)/10 outline-none cursor-pointer"
        >
          {name[0].toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content backdrop-blur-xl relative top-2 right-20 border-(--muted-foreground)/30" align="start">
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
  ) : (
    <div>
      <Link
        href="/login"
        className="rounded-md border border-border px-3 py-1.5 text-(--foreground) hover:bg-(--muted)"
      >
        Sign in
      </Link>
    </div>
  )
}

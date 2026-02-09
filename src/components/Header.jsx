"use client";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToFeatures = () => {
    setMenuOpen(false);
    if (pathname !== "/") {
      router.push("/#features");
    } else {
      document
        .getElementById("features")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-(--border)  backdrop-blur bg-(--background)/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-(--foreground) flex items-center gap-2"
        >
          <img src={'/icon.svg'} className="size-8" />
          LineLess
        </Link>

        <nav className="flex items-center gap-6 text-sm text-(--muted-foreground) not-sm:hidden">
          <ThemeSwitcher />
          <button onClick={scrollToFeatures} className="hover:text-(--foreground) cursor-pointer">
            Features
          </button>
          <Link href="/guide" className="hover:text-(--foreground)">
            Guide
          </Link>

          <Link
            href="/login"
            className="rounded-md border border-(--border) px-3 py-1.5 text-(--foreground) hover:bg-(--muted)"
          >
            Sign in
          </Link>
        </nav>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-(--border) p-2 text-(--foreground) transition hover:bg-(--muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border) sm:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div
        id="primary-nav"
        className={`border-t border-(--border) bg-(--background)/80 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.08)] md:hidden transition-[max-height,opacity,transform] duration-300 ease-out overflow-hidden ${menuOpen
          ? "max-h-80 opacity-100 translate-y-0"
          : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
          }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 text-sm text-(--muted-foreground)">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-(--muted-foreground)">
              Menu
            </span>
            <ThemeSwitcher />
          </div>
          <div className="h-px w-full bg-(--border)" />
          <button
            onClick={scrollToFeatures}
            className="text-left hover:text-(--foreground)"
          >
            Features
          </button>
          <Link
            href="/guide"
            className="hover:text-(--foreground)"
            onClick={() => setMenuOpen(false)}
          >
            Guide
          </Link>
          <Link
            href="/login"
            className="w-fit rounded-md border border-(--border) px-3 py-1.5 text-(--foreground) transition hover:bg-(--muted)"
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Link>
        </div>
      </div >
    </header>
  );
}

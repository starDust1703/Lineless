"use client";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--border)  backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          LineLess
        </Link>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <ThemeSwitcher />
          <Link href="/features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>

          <Link
            href="/login"
            className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-muted"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

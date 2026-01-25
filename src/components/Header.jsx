"use client";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { usePathname, useRouter } from "next/navigation";

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

  return (
    <header className="sticky top-0 z-50 border-b border-(--border)  backdrop-blur">
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
          <Link href="/pricing" className="hover:text-(--foreground)">
            Pricing
          </Link>

          <Link
            href="/login"
            className="rounded-md border border-border px-3 py-1.5 text-(--foreground) hover:bg-(--muted)"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

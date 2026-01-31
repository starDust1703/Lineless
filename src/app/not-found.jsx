import SplashCursor from "../components/ui/SplashCursor";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-(--background)">
      <SplashCursor />
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-(--foreground)">404</h1>
        <p className="text-(--muted-foreground)">
          This page doesn’t exist. It never did.
        </p>

        <Link
          href="/"
          className="inline-block mt-4 rounded-lg bg-(--primary) px-6 py-3 text-(--primary-foreground) font-medium hover:opacity-90"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}

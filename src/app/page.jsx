"use client";
import ClickSpark from "../components/ClickSpark";
import TextType from "../components/TextType";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";

export default function Home() {
  // const supabase = createClient();

  return (
    <ClickSpark
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <main className="min-h-[80vh] flex flex-col bg-(--background)">
        <section className="mt-20 flex items-center justify-center px-6">
          <div className="max-w-3xl text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold p-2 text-blue-500">
              <TextType
                text={["Lineless", "Smart Queue Management", "Save time!"]}
                typingSpeed={75}
                pauseDuration={1500}
                deletingSpeed={50}
                variablespeedmin={60}
                variablespeedmax={120}
              />
            </h1>

            <p className="text-muted-foreground text-lg">
              An online queue app that replaces physical lines with digital tokens so users can wait remotely and get notified.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-(--primary) px-6 py-3 text-(--primary-foreground) font-medium hover:bg-(--primary)/90 transition"
              >
                Get Started
              </Link>

              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-(--foreground) hover:bg-(--muted) transition"
              >
                Docs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </ClickSpark>
  );
}

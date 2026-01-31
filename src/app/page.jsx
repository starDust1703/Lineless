"use client";
import Header from "../components/Header";
import ClickSpark from "../components/ui/ClickSpark";
import TextType from "../components/ui/TextType";
import Link from "next/link";
import Footer from "../components/Footer";
import UserHeader from "../components/UserHeader";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

const features = [
  {
    title: "Digital Tokens",
    description:
      "Users join a queue remotely and receive a digital token instead of standing in line.",
  },
  {
    title: "Real-Time Updates",
    description:
      "Automatic notifications keep users informed about their position and wait time.",
  },
  {
    title: "Admin Dashboard",
    description:
      "Businesses monitor queue status, manage flow, and handle exceptions in one place.",
  },
  {
    title: "Crowd Reduction",
    description:
      "Fewer people waiting on-site means less chaos and better service quality.",
  },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
      });
    }

    checkUser();
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div>
      {user ? <UserHeader user={user} /> : <Header />}
      <ClickSpark
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <main className="min-h-screen flex flex-col bg-(--background)">

          <section className="mt-24 flex min-h-[60vh] flex-col items-center justify-center px-6 text-center lg:min-h-[70vh]">
            <h1 className="p-3 text-2xl font-bold sm:text-4xl lg:text-6xl text-(--primary)">
              <TextType
                text={["Lineless", "Queues, Without the Queue", "No Lines. No Chaos."]}
                typingSpeed={75}
                pauseDuration={1500}
                deletingSpeed={50}
                variablespeedmin={60}
                variablespeedmax={120}
              />
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-(--muted-foreground)">
              Lineless replaces physical queues with digital tokens, letting users wait remotely and get notified in real time.
            </p>

            <div className="mt-8 flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-lg bg-(--primary) px-6 py-3 font-medium
                   text-(--primary-foreground) shadow-md transition
                   hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-(--ring)
                   active:translate-y-0.5 sm:w-auto"
              >
                Get Started
              </Link>

              <Link
                href="/about"
                className="inline-flex w-full items-center justify-center rounded-lg border border-border px-6 py-3
                   text-(--foreground) transition
                   hover:bg-(--muted) focus:outline-none focus:ring-4 focus:ring-(--ring)
                   sm:w-auto"
              >
                About Us
              </Link>
            </div>

            <p className="mt-6 text-sm text-(--muted-foreground)">
              Trusted by early adopters · Real-time updates · Zero chaos
            </p>
          </section>

          <section className="py-24 px-6 text-center bg-(--background)">
            <h2 className="mx-auto max-w-3xl text-4xl font-bold text-(--foreground) lg:text-5xl">
              Manage Queues Digitally. Keep Everything Moving.
            </h2>
            <p className="mx-auto mt-6 max-w-prose text-lg text-(--muted-foreground)">
              Lineless helps you manage queues digitally, track flow in real time, and reduce on-site congestion.
            </p>
          </section>

          <section id="features" className="bg-(--muted)/5 py-24 px-6">
            <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl bg-(--card) p-6 text-(--card-foreground)
                     shadow transition hover:shadow-lg"
                >
                  <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-(--muted-foreground)">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-(--background)/90 py-24 px-6 text-center">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold text-(--foreground)">
              Join businesses moving away from physical queues.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-(--muted-foreground)">
              Start managing queues instantly. No delays. No headaches. Just flow.
            </p>

            <Link
              href="/signup"
              className="mt-8 inline-block rounded-lg bg-(--primary) px-8 py-3 font-medium
                 text-(--primary-foreground) shadow-md transition
                 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-(--ring)"
            >
              Try Lineless
            </Link>
          </section>
        </main>

      </ClickSpark>
      <Footer />
    </div>
  );
}

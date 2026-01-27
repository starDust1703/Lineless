"use client";
import ClickSpark from "../components/ClickSpark";
import TextType from "../components/TextType";
import Link from "next/link";

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
  return (
    <ClickSpark
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <main className="min-h-screen flex flex-col bg-(--background)">
        <section className="mt-24 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl sm:text-5xl font-bold p-2 text-blue-500">
            <TextType
              text={["Lineless", "Queues, Without the Queue", "No Lines. No Chaos."]}
              typingSpeed={75}
              pauseDuration={1500}
              deletingSpeed={50}
              variablespeedmin={60}
              variablespeedmax={120}
            />
          </h1>

          <p className="text-(--muted-foreground) text-lg mt-4 max-w-2xl">
            Lineless replaces physical queues with digital tokens, letting users wait remotely and get notified in real time.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-(--primary) px-6 py-3 text-(--primary-foreground) font-medium hover:bg-(--primary)/90 transition"
            >
              Get Started
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-(--foreground) hover:bg-(--muted) transition"
            >
              About Us
            </Link>
          </div>
        </section>

        <section className="bg-(--background) py-24 px-6 text-center">
          <h1 className="text-5xl font-bold text-(--foreground) max-w-3xl mx-auto">
            Manage Queues Digitally. Keep Everything Moving.
          </h1>
          <p className="mt-6 text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Lineless helps you manage queues digitally, track flow in real time, and reduce on-site congestion.
          </p>
        </section>

        <section id="features" className="py-24 px-6 bg-(--muted)/5">
          <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-(--card) text-(--card-foreground) p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-(--muted-foreground)">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 px-6 text-center bg-(--background)/90">
          <h2 className="text-3xl font-bold text-(--foreground) max-w-2xl mx-auto">
            Join businesses already moving away from physical queues and toward smarter operations.
          </h2>
          <p className="mt-4 text-(--muted-foreground) max-w-xl mx-auto">
            Sign up and start managing your queues instantly. No delays, no headaches, just clean, simple management.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block bg-(--primary) text-(--primary-foreground) px-8 py-3 rounded-md font-medium hover:bg-(--primary)/90 transition"
          >
            Try Lineless
          </Link>
        </section>

      </main>
    </ClickSpark>
  );
}

export default function About() {
  return (
    <main className="min-h-screen px-6 py-24 bg-(--background) text-(--foreground)">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">About Lineless</h1>

        <p className="text-(--muted-foreground)">
          Lineless replaces physical queues with digital tokens. No standing,
          no confusion, no crowding.
        </p>

        <p className="text-(--muted-foreground)">
          Users join queues remotely. Businesses manage flow in real time.
          Everyone wastes less time.
        </p>

        <p className="text-(--muted-foreground)">
          Built with Next.js and Supabase because boring problems deserve
          clean solutions.
        </p>
      </div>
    </main>
  );
}

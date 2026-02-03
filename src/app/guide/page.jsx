export default function GuidePage() {
  return (
    <main className="min-h-screen text-(--foreground) px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-20">

        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-(--foreground)">
            Lineless Guide
          </h1>
          <p className="text-(--muted-foreground)">
            Everything you need to use Lineless. Nothing you don’t.
          </p>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-(--foreground)">
            For Queue Organizers
          </h2>

          <div className="space-y-6">
            <Step
              number="1"
              title="Create a Queue"
              desc="Click on Create Queue, set a name, and generate a Queue Key (QKey). This is what users will use to join."
            />
            <Step
              number="2"
              title="Share the QKey or QR"
              desc="Share the QKey or QR code with participants. No accounts or links required."
            />
            <Step
              number="3"
              title="Manage the Queue"
              desc="Call the next person, skip, or close the queue when done. You’re in control."
            />
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-(--foreground)">
            For Participants
          </h2>

          <div className="space-y-6">
            <Step
              number="1"
              title="Enter the QKey"
              desc="Open Lineless, enter the Queue Key provided by the organizer."
            />
            <Step
              number="2"
              title="Join the Queue"
              desc="You’ll instantly get your position in the queue."
            />
            <Step
              number="3"
              title="Wait Smart"
              desc="No standing in line. Just show up when it’s your turn."
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-(--foreground)">
            Good to Know
          </h2>

          <ul className="space-y-4 text-(--muted-foreground)">
            <li>• QKeys are short and easy to share</li>
            <li>• UUIDs stay hidden in the backend</li>
            <li>• Old queues may expire automatically</li>
            <li>• No unnecessary data collection</li>
          </ul>
        </section>

        <section className="border-t border-(--foreground)/80 pt-10 text-center space-y-4">
          <p className="text-(--muted-foreground)">
            Still confused? The app is simpler than this page.
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="/dashboard"
              className="rounded-lg bg-(--foreground) px-6 py-3 text-sm font-medium text-(--background) hover:opacity-95"
            >
              Go to Dashboard
            </a>

            <a
              href="/dashboard"
              className="rounded-lg border border-(--foreground) px-6 py-3 text-sm text-(--foreground) hover:bg-(--foreground)/10"
            >
              Get Started
            </a>
          </div>
        </section>


      </div>
    </main>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="flex size-8 items-center justify-center rounded-full bg-(--foreground) text-sm font-semibold text-(--background)">
        {number}
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-(--foreground)">{title}</h3>
        <p className="text-sm text-(--muted-foreground)">{desc}</p>
      </div>
    </div>
  );
}

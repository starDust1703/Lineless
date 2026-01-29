export default function GuidePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-20">

        {/* Header */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Lineless Guide
          </h1>
          <p className="text-neutral-400">
            Everything you need to use Lineless. Nothing you don’t.
          </p>
        </section>

        {/* For Organizers */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-white">
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

        {/* For Participants */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-white">
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

        {/* FAQ-lite */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">
            Good to Know
          </h2>

          <ul className="space-y-4 text-neutral-300">
            <li>• QKeys are short and easy to share</li>
            <li>• UUIDs stay hidden in the backend</li>
            <li>• Old queues may expire automatically</li>
            <li>• No unnecessary data collection</li>
          </ul>
        </section>

        <section className="border-t border-neutral-800 pt-10 text-center space-y-4">
          <p className="text-neutral-400">
            Still confused? The app is simpler than this page.
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="/dashboard"
              className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-neutral-200"
            >
              Go to Dashboard
            </a>

            <a
              href="/dashboard"
              className="rounded-lg border border-neutral-700 px-6 py-3 text-sm text-white hover:bg-neutral-900"
            >
              Get Started
            </a>
          </div>
        </section>


      </div>
    </main>
  );
}

/* Reusable Step Component */
function Step({ number, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
        {number}
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-sm text-neutral-400">{desc}</p>
      </div>
    </div>
  );
}

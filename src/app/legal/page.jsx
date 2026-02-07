export const metadata = {
  title: "Lineless - Legal",
  description: "Terms of Service and Privacy Policy for Lineless, the online queue management app that replaces physical lines with digital tokens. Read about our terms of use, data collection practices, and how we protect your privacy while using Lineless.",
};

export default function LegalPage() {
  return (
    <main className="min-h-screen text-(--foreground) px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-16">

        {/* Header */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Legal
          </h1>
          <p className="text-(--muted-foreground)">
            Terms of Service & Privacy Policy
          </p>
          <p className="text-(--foreground)/70 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </section>

        {/* Quick Nav */}
        <nav className="flex gap-6 text-sm text-(--muted-foreground)/80">
          <a href="#terms" className="hover:text-(--foreground)">
            Terms
          </a>
          <a href="#privacy" className="hover:text-(--foreground)">
            Privacy
          </a>
        </nav>

        {/* Terms of Service */}
        <section id="terms" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-(--foreground)">
            Terms of Service
          </h2>

          <p>
            Lineless is a digital queue management platform that helps reduce
            offline waiting chaos. By using this service, you agree to these
            terms. If you don’t agree, don’t use the app.
          </p>

          <ul className="list-disc list-inside space-y-2 text-(--foreground)/80">
            <li>Use Lineless only for legitimate queue management</li>
            <li>Do not abuse, spam, or manipulate queues</li>
            <li>Do not attempt to exploit or disrupt the system</li>
          </ul>

          <p>
            Queue creators are responsible for how their queues are managed.
            Lineless is not liable for missed turns, disputes, or real-world
            outcomes.
          </p>

          <p>
            The service is provided “as is”. Features may change or be removed
            without notice.
          </p>
        </section>

        {/* Privacy Policy */}
        <section id="privacy" className="space-y-6 scroll-mt-24">
          <h2 className="text-2xl font-semibold text-(--foreground)">
            Privacy Policy
          </h2>

          <p>
            We collect only the minimum data required to run queues properly.
            No unnecessary tracking.
          </p>

          <ul className="list-disc list-inside space-y-2 text-(--foreground)/80">
            <li>Queue identifiers (UUIDs and QKeys)</li>
            <li>Queue timestamps and position</li>
            <li>Optional user identifiers if authentication is enabled</li>
          </ul>

          <p>
            Data is used strictly for queue functionality and service
            improvement. We do not sell or rent user data.
          </p>

          <p>
            Queue data may be deleted automatically after completion or
            expiration.
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-(--muted-foreground) pt-8 space-y-2 text-sm text-(--foreground)">
          <p>
            Contact: <span className="text-(--foreground)">support@lineless.app</span>
          </p>
          <p>
            © {new Date().getFullYear()} Lineless
          </p>
        </footer>

      </div>
    </main>
  );
}

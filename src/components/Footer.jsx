export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-(--border) bg-(--background)">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-(--foreground)">
            © {year} Lineless. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-(--muted-foreground)">
            <a href="/privacy" className="hover:text-(--primary)">
              Privacy
            </a>
            <a href="/terms" className="hover:text-(--primary)">
              Terms
            </a>
            <a href="https://github.com/starDust1703/LineLess" target="_blank" rel="noopener noreferrer" className="hover:text-(--primary)">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

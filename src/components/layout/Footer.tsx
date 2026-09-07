export default function Footer() {
  return (
    <footer className="border-t border-mist">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-ink-soft sm:flex-row sm:px-8">
        <p>&copy; 2026 Detasawy</p>
        <p className="text-center">
          A community-built data portal for{" "}
          <span
            dir="rtl"
            lang="ps"
            className="font-naskh font-bold text-azure-deep"
          >
            پښتو
          </span>
        </p>
        <a
          className="font-semibold transition-colors hover:text-ink"
          href="https://github.com/wak3168-eng"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

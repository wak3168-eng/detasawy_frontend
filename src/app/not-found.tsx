import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ice px-5 text-center">
      <div>
        <p className="text-6xl font-extrabold text-azure">404</p>
        <p className="mt-3 text-ink-soft">This page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-azure px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}

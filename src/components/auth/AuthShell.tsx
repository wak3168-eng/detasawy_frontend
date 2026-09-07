import Link from "next/link";

export default function AuthShell({
  title,
  sub,
  alt,
  children,
}: {
  title: string;
  sub?: string;
  alt: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-ice px-5 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-azure text-sm font-extrabold text-white">
            D
          </span>
          <span className="font-extrabold tracking-tight">Detasawy</span>
        </Link>
        <h1 className="mt-6 text-center text-2xl font-extrabold tracking-tight">
          {title}
        </h1>
        {sub && (
          <p className="mt-1.5 text-center text-sm text-ink-soft">{sub}</p>
        )}
        <div className="mt-7 rounded-2xl border border-mist bg-white/70 p-6">
          {children}
        </div>
        <p className="mt-5 text-center text-sm text-ink-soft">{alt}</p>
      </div>
    </main>
  );
}

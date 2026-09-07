import Link from "next/link";
import PlayQuestion from "@/components/onboarding/PlayQuestion";

export default function StepShell({
  progress,
  onBack,
  title,
  subtitle,
  audioSrc,
  children,
}: {
  progress: number;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  audioSrc?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Back"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-mist text-ink-soft transition-colors hover:bg-mist"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <Link
            href="/"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-azure text-sm font-extrabold text-white"
          >
            D
          </Link>
        )}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
          <div
            className="h-full rounded-full bg-azure transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          {audioSrc && <PlayQuestion src={audioSrc} />}
        </div>
        {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      <div className="mt-6 flex-1">{children}</div>
    </main>
  );
}

import Link from "next/link";
import GlobeSection from "@/components/globe/GlobeSection";

const DEMO_REPLIES = [
  { ps: "څنګه يې؟", tag: null },
  { ps: "ښه يم", tag: "Peshawar" },
  { ps: "ښه يوم", tag: "Afridi · Khyber" },
];

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:pb-24 lg:pt-20">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-sky bg-mist/60 px-3.5 py-1.5 text-xs font-bold tracking-wide text-azure-deep">
          <span className="dot-pulse size-1.5 rounded-full bg-azure" />
          Under construction
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          The Pashto
          <br />
          of <span className="text-azure">tomorrow</span>.
        </h1>
        <p className="mt-4 max-w-md text-lg text-ink-soft">
          Built by its speakers, one word at a time.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-azure px-6 py-3 text-sm font-bold text-white shadow-lg shadow-azure/30 transition-colors hover:bg-azure-deep"
          >
            Sign up
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-sky px-6 py-3 text-sm font-bold text-azure-deep transition-colors hover:bg-mist"
          >
            How it works
          </a>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-2">
          {DEMO_REPLIES.map((reply) => (
            <span
              key={reply.ps}
              className="inline-flex items-baseline gap-2 rounded-2xl border border-mist bg-white/70 px-4 py-2"
            >
              <span
                dir="rtl"
                lang="ps"
                className="font-naskh text-base font-bold text-ink"
              >
                {reply.ps}
              </span>
              {reply.tag && (
                <span className="text-[11px] font-semibold text-ink-soft">
                  {reply.tag}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
      <div className="relative aspect-square w-full max-w-[520px] justify-self-center overflow-hidden rounded-3xl border border-mist bg-gradient-to-b from-mist/50 to-ice lg:justify-self-end">
        <GlobeSection />
      </div>
    </section>
  );
}

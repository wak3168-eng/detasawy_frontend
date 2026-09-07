const STEPS = [
  {
    title: "Name it",
    body: "See a picture. Give its Pashto name.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-4.5-4.5L7 20" />
      </svg>
    ),
  },
  {
    title: "Reply in your dialect",
    body: "Same question, many Pashtos. All of them count.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <path d="M21 12a8 8 0 0 1-8 8H4l2.5-2.5A8 8 0 1 1 21 12Z" />
        <path d="M9 11h6M9 14h3" />
      </svg>
    ),
  },
  {
    title: "Say it aloud",
    body: "Your voice teaches machines to listen.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
        How it works
      </h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-mist bg-white/60 p-6"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-mist text-azure-deep">
              {step.icon}
            </span>
            <h3 className="mt-4 text-lg font-extrabold">{step.title}</h3>
            <p className="mt-1.5 text-sm text-ink-soft">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  "You contribute — words, voice, replies.",
  "The community checks each other's work.",
  "Accepted work earns Kaar Points.",
  "Points unlock the datasets you helped build.",
];

export default function PointsCard() {
  return (
    <div className="rounded-3xl border border-mist bg-white/70 p-5">
      <h2 className="font-extrabold">How Kaar Points work</h2>
      <ol className="mt-3 space-y-2.5">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-start gap-2.5 text-sm text-ink-soft">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mist text-[11px] font-extrabold text-azure-deep">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

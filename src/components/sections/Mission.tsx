const PRINCIPLES = ["Owned by speakers", "Earned, not bought", "Open source"];

export default function Mission() {
  return (
    <section id="mission" className="border-t border-mist bg-white/40">
      <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:py-24">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Why Detasawy
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          Forty million people speak Pashto. Machines barely understand it.
          We&apos;re building the open datasets that change that &mdash; created
          by the community, owned by the community.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {PRINCIPLES.map((principle) => (
            <span
              key={principle}
              className="rounded-full border border-sky bg-ice px-4 py-2 text-sm font-bold text-azure-deep"
            >
              {principle}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

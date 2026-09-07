import { HOMELAND } from "@/lib/regions";

export default function MapFallback() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div className="absolute left-1/2 top-1/2 size-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-mist to-ice ring-1 ring-sky/60" />
      <div className="absolute left-1/2 top-1/2 size-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky/40" />
      <div className="absolute left-1/2 top-1/2 size-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky/30" />
      {HOMELAND.map((region, i) => (
        <div
          key={region.name}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${region.fx}%`, top: `${region.fy}%` }}
        >
          <span
            className="ring-pulse absolute -inset-1.5 rounded-full border border-azure/50"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
          <span className="block size-2 rounded-full bg-azure-deep" />
        </div>
      ))}
    </div>
  );
}

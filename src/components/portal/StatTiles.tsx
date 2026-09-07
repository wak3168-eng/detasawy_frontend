const TILES = [
  { value: "0", label: "day streak", icon: "🔥" },
  { value: "0", label: "words accepted", icon: "✅" },
  { value: "—", label: "overall rank", icon: "🌍" },
  { value: "—", label: "district rank", icon: "🏆" },
];

export default function StatTiles() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
      {TILES.map((tile) => (
        <div
          key={tile.label}
          className="rounded-2xl border border-mist bg-white/70 px-2 py-4 text-center"
        >
          <p className="text-xl font-extrabold text-azure-deep sm:text-2xl">
            <span className="mr-1.5">{tile.icon}</span>
            {tile.value}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-ink-soft">
            {tile.label}
          </p>
        </div>
      ))}
    </div>
  );
}

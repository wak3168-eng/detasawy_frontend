export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-mist bg-ice/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-azure text-sm font-extrabold text-white">
            D
          </span>
          <span className="text-[15px] font-extrabold tracking-tight">
            Detasawy
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-soft sm:flex">
          <a href="#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#mission" className="transition-colors hover:text-ink">
            Why
          </a>
        </nav>
        <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-bold text-azure-deep">
          <span className="dot-pulse size-1.5 rounded-full bg-azure" />
          Soon
        </span>
      </div>
    </header>
  );
}

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import AuthNav from "@/components/layout/AuthNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-mist bg-ice/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <Link href="/" className="flex items-center">
          <Logo size={30} tagline />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-soft md:flex">
          <Link href="/contribute" className="transition-colors hover:text-ink">
            Contribute
          </Link>
          <a href="/#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="/#mission" className="transition-colors hover:text-ink">
            Why
          </a>
        </nav>
        <AuthNav />
      </div>
    </header>
  );
}

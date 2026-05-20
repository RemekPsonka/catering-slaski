import Link from "next/link"
import { LogoSymbol } from "@/components/brand/LogoSymbol"
import { User, ArrowRight } from "lucide-react"
import { CartBadge } from "./CartBadge"

export function Header() {
  return (
    <>
      {/* Top deadline strip */}
      <div className="bg-coal-900 text-paper-100 text-xs">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-500 animate-pulse-slow"></span>
            <span className="label">Zamów do 16:00 — przywieziemy jutro</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-paper-100/70">
            <a href="tel:+48793001900" className="hover:text-paper-100 transition">+48 793 001 900</a>
            <span>Dąbrowa Górnicza · 25+ miast Śląska</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="bg-paper-100 border-b border-bone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4" aria-label="Catering Śląski">
            <LogoSymbol className="w-9 h-12 text-coal-900" />
            <div className="leading-none">
              <div className="display upper-tight font-bold text-coal-900 text-base">Catering</div>
              <div className="display upper-tight font-bold text-coal-900 text-base">Śląski <span className="font-normal">_</span></div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-9 text-sm font-medium" aria-label="Główna">
            <Link href="/menu" className="text-coal-900 hover:text-signal-500 transition">Menu</Link>
            <Link href="/konfigurator" className="text-coal-900 hover:text-signal-500 transition flex items-center gap-2">
              AI Generator
              <span className="w-1.5 h-1.5 rounded-full bg-signal-500 animate-pulse-slow"></span>
            </Link>
            <Link href="/dla-firm" className="text-coal-900 hover:text-signal-500 transition">Dla firm</Link>
            <Link href="/dostawa" className="text-coal-900 hover:text-signal-500 transition">Dostawa</Link>
            <Link href="/o-nas" className="text-coal-900 hover:text-signal-500 transition">O nas</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/konto" className="hidden md:inline-flex items-center justify-center w-11 h-11 hover:bg-bone-200 transition" aria-label="Konto">
              <User size={18} />
            </Link>
            <CartBadge />
            <Link href="/konfigurator" className="btn-coal">
              Zamów <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}

import Link from "next/link"
import { User, Package, MapPin, Repeat, Award, Settings, LogOut } from "lucide-react"

const NAV = [
  { href: "/konto",              label: "Przegląd",      icon: User },
  { href: "/konto/zamowienia",   label: "Zamówienia",    icon: Package },
  { href: "/konto/adresy",       label: "Adresy",        icon: MapPin },
  { href: "/konto/subskrypcje",  label: "Subskrypcje",   icon: Repeat },
  { href: "/konto/lojalnosc",    label: "Lojalność",     icon: Award },
  { href: "/konto/ustawienia",   label: "Ustawienia",    icon: Settings },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className="bg-paper-100 min-h-[60vh]">
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-snow-50 border border-bone-200 p-5 lg:sticky lg:top-32">
              <div className="pb-4 mb-4 border-b border-coal-900/10">
                <div className="label text-graphite-500 mb-1">Konto</div>
                <div className="display upper-tight font-bold text-coal-900 text-lg">Remigiusz Psonka</div>
                <div className="text-xs text-coal-900/60">remek@ideecom.pl</div>
              </div>
              <nav className="space-y-0.5">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-coal-900 hover:text-paper-100 transition"
                  >
                    <item.icon size={16} strokeWidth={1.8} />
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2 mt-2 border-t border-coal-900/10">
                  <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-coal-900/60 hover:text-signal-500 transition">
                    <LogOut size={16} strokeWidth={1.8} />
                    Wyloguj
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9">{children}</div>
        </div>
      </section>
    </article>
  )
}

import Link from "next/link"
import { LogoSymbol } from "@/components/brand/LogoSymbol"
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup"

export function Footer() {
  return (
    <footer className="bg-coal-900 text-paper-100 border-t border-coal-700 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <LogoSymbol className="w-9 h-12 text-paper-100" />
              <div className="display upper-tight font-bold text-paper-100">
                <div>Catering</div>
                <div>Śląski <span className="font-normal">_</span></div>
              </div>
            </div>
            <p className="text-paper-100/60 leading-relaxed max-w-sm mb-6 text-sm">
              Catering eventowy i lunch firmowy od 2019 roku w Dąbrowie Górniczej. Górny Śląsk.
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="label text-paper-100/50 mb-4">Menu</div>
            <ul className="space-y-2.5 text-sm text-paper-100/80">
              <li><Link href="/menu/box-cateringowy" className="hover:text-signal-500 transition">Catering BOX</Link></li>
              <li><Link href="/menu/finger-food" className="hover:text-signal-500 transition">Finger food</Link></li>
              <li><Link href="/menu/zimna-plyta" className="hover:text-signal-500 transition">Zimna płyta</Link></li>
              <li><Link href="/menu/komunia-2026" className="hover:text-signal-500 transition">Komunia 2026</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="label text-paper-100/50 mb-4">Firma</div>
            <ul className="space-y-2.5 text-sm text-paper-100/80">
              <li><Link href="/o-nas" className="hover:text-signal-500 transition">O nas</Link></li>
              <li><Link href="/realizacje" className="hover:text-signal-500 transition">Realizacje</Link></li>
              <li><Link href="/blog" className="hover:text-signal-500 transition">Blog</Link></li>
              <li><Link href="/kontakt" className="hover:text-signal-500 transition">Kontakt</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="label text-paper-100/50 mb-4">Kontakt</div>
            <ul className="space-y-2.5 text-sm text-paper-100/80">
              <li><a href="tel:+48793001900" className="hover:text-signal-500 transition">+48 793 001 900</a></li>
              <li><a href="mailto:zamowienia@cateringslaski.pl" className="hover:text-signal-500 transition">zamowienia@cateringslaski.pl</a></li>
              <li className="pt-2 text-paper-100/60">Marcina Kasprzaka 256<br/>41-303 Dąbrowa Górnicza</li>
              <li className="text-paper-100/60">Pn–Nd · 8:00–17:00</li>
            </ul>
            <div className="mt-6 pt-6 border-t border-paper-100/10">
              <NewsletterSignup source="footer" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-paper-100/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-paper-100/40">
          <div>© {new Date().getFullYear()} Catering Śląski · Wszystkie prawa zastrzeżone</div>
          <div className="flex gap-6">
            <Link href="/polityka-prywatnosci" className="hover:text-signal-500 transition">Polityka prywatności</Link>
            <Link href="/regulamin" className="hover:text-signal-500 transition">Regulamin</Link>
            <Link href="/zwroty" className="hover:text-signal-500 transition">Reklamacje i zwroty</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

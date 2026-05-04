import Link from "next/link"
import { Mic2 } from "lucide-react"

const NAV_LINKS = [
  { href: "/tertulia/formato", label: "Formato" },
  { href: "/tertulia/temas", label: "Temas" },
  { href: "/tertulia/sesiones", label: "Sesiones" },
  { href: "/tertulia/escaleta", label: "Escaleta" },
  { href: "/tertulia/roles", label: "Roles" },
  { href: "/tertulia/dosier", label: "Dosier" },
]

export default function TertuliaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50">
      <header className="sticky top-0 z-50 w-full border-b border-amber-200/60 bg-white/85 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-5xl">
          <Link href="/tertulia" className="flex items-center gap-2 font-semibold text-stone-800 hover:text-amber-700 transition-colors">
            <Mic2 className="h-5 w-5 text-amber-700" />
            <span className="hidden sm:inline text-sm">Debates en La Tertulia</span>
            <span className="sm:hidden text-sm">La Tertulia</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 px-2.5 py-1 text-xs rounded-md text-stone-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-amber-200/60 bg-white/60 py-6">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Producción e Interacción Oral B2 · CLM-UGR · Mayo 2026</span>
          <span className="font-mono text-stone-400 select-none" title="Marca del autor">[|]</span>
        </div>
      </footer>
    </div>
  )
}

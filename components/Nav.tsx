'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavProps {
  nome: string
  perfil: string
  boutique: string
}

export default function Nav({ nome, perfil, boutique }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Início' },
    { href: '/especificacao', label: 'Nova especificação' },
    { href: '/historico', label: 'Histórico' },
    ...(perfil === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="bg-[#2C2520] text-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-serif text-xl text-[#C4A882] tracking-widest">TEZ</Link>
          <nav className="hidden sm:flex gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  pathname.startsWith(l.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-white/90 leading-none">{nome}</p>
            <p className="text-xs text-[#C4A882]/70 mt-0.5">{boutique}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-white/50 hover:text-white/90 transition-colors px-2 py-1 rounded"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden flex border-t border-white/10 overflow-x-auto">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 min-w-max px-3 py-2 text-center text-xs transition-colors ${
              pathname.startsWith(l.href) ? 'text-[#C4A882] border-b-2 border-[#C4A882]' : 'text-white/60'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  )
}

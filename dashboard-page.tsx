'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard, { getUser, authFetch } from '@/components/AuthGuard'
import Nav from '@/components/Nav'

const CATS = [
  {
    id: 'cimento',
    nome: 'Cimento Queimado',
    desc: 'Matte e Lunar · 22 cores',
    imgUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
    tag: 'Parede e Teto',
  },
  {
    id: 'cristal',
    nome: 'Cristal de Pedras Naturais',
    desc: '#10 e #20 · 21 referências',
    imgUrl: 'https://images.unsplash.com/photo-1615971677499-5467cbab01b0?w=800&q=80',
    tag: 'Interno e Externo',
  },
  {
    id: 'drenante',
    nome: 'Piso Drenante Resinado',
    desc: '15 cores · Solo e Contrapiso',
    imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    tag: 'Uso Externo',
  },
  {
    id: 'granulado',
    nome: 'Granulados',
    desc: '9 cores · 8 kg/m²',
    imgUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    tag: 'Interno e Externo',
  },
]

function DashboardContent() {
  const user = getUser()
  const [sims, setSims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch('/api/simulacoes').then(r => r.json()).then(d => {
      setSims((d.simulacoes || []).slice(0, 5))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      <Nav />

      {/* Hero banner */}
      <div className="bg-[#2C2520] px-6 py-10 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-white">
              Olá, {user?.nome?.split(' ')[0]}.
            </h1>
            <p className="text-sm text-white/50 mt-1">{user?.boutiqueName}</p>
          </div>
          <Link
            href="/especificacao"
            className="shrink-0 flex items-center gap-3 bg-[#D4875A] hover:bg-[#C4774A] text-white px-5 py-3 rounded-xl transition-colors group"
          >
            <span className="text-sm font-medium">Nova especificação</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Cards das famílias — 4 colunas full-width */}
        <div className="mb-10">
          <h2 className="text-xs font-medium text-[#6B5A4E] tracking-widest uppercase mb-4">Famílias de produto</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CATS.map(cat => (
              <Link key={cat.id} href={`/especificacao?cat=${cat.id}`}
                className="group rounded-2xl overflow-hidden border border-[#E8DFD0] bg-white hover:border-[#C4A882] hover:shadow-md transition-all">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={cat.imgUrl}
                    alt={cat.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-xs text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {cat.tag}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-[#2C2520] leading-tight">{cat.nome}</p>
                  <p className="text-xs text-[#6B5A4E] mt-0.5">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Simulações recentes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-[#6B5A4E] tracking-widest uppercase">Simulações recentes</h2>
            <Link href="/historico" className="text-xs text-[#C4A882] hover:text-[#D4875A] transition-colors">Ver todas →</Link>
          </div>

          {loading ? (
            <div className="bg-white border border-[#E8DFD0] rounded-xl p-6 text-center text-sm text-[#6B5A4E]">
              Carregando...
            </div>
          ) : sims.length === 0 ? (
            <div className="bg-white border border-[#E8DFD0] rounded-xl p-10 text-center">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm text-[#6B5A4E]">Nenhuma simulação ainda.</p>
              <p className="text-xs text-[#6B5A4E]/60 mt-1">Use "Nova especificação" para começar.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E8DFD0] rounded-xl overflow-hidden">
              {sims.map((s: any, i: number) => {
                const res = s.resultado as any
                const dt = new Date(s.criadoEm).toLocaleDateString('pt-BR')
                return (
                  <div key={s.id}
                    className={`flex items-center justify-between px-5 py-3.5 ${i < sims.length-1 ? 'border-b border-[#F0E8DC]' : ''}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2C2520] truncate">{s.produto}</p>
                      <p className="text-xs text-[#6B5A4E] mt-0.5">{dt} · {s.nomeUsuario}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      {res?.areaComPerda && (
                        <p className="text-sm font-medium text-[#2C2520]">{res.areaComPerda.toFixed(1)} m²</p>
                      )}
                      {res?.totalGeral > 0 && (
                        <p className="text-xs text-[#C4A882]">
                          R$ {res.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return <AuthGuard><DashboardContent /></AuthGuard>
}

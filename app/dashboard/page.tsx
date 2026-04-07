'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard, { getUser, authFetch } from '@/components/AuthGuard'
import Nav from '@/components/Nav'

const CATS = [
  { id:'cimento', nome:'Cimento Queimado', icon:'🪣', desc:'Matte e Lunar' },
  { id:'cristal', nome:'Cristal de Pedras Naturais', icon:'✨', desc:'#10 e #20' },
  { id:'drenante', nome:'Piso Drenante Resinado', icon:'🌧️', desc:'Uso externo' },
  { id:'granulado', nome:'Granulados', icon:'🪨', desc:'9 cores' },
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
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-[#2C2520]">Olá, {user?.nome?.split(' ')[0]}.</h1>
          <p className="text-sm text-[#6B5A4E] mt-1">{user?.boutiqueName}</p>
        </div>

        <Link href="/especificacao" className="flex items-center justify-between w-full bg-[#2C2520] text-white rounded-xl px-6 py-5 mb-8 hover:bg-[#8B6B4A] transition-colors group">
          <div>
            <p className="text-lg font-medium">Nova especificação</p>
            <p className="text-sm text-white/60 mt-0.5">Calcular quantidade de material</p>
          </div>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <div className="mb-8">
          <h2 className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase mb-3">Acesso rápido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATS.map(cat => (
              <Link key={cat.id} href={`/especificacao?cat=${cat.id}`}
                className="bg-white border border-[#E8DFD0] rounded-xl p-4 hover:border-[#C4A882] transition-all">
                <div className="text-2xl mb-2">{cat.icon}</div>
                <p className="text-sm font-medium text-[#2C2520]">{cat.nome}</p>
                <p className="text-xs text-[#6B5A4E] mt-0.5">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase">Simulações recentes</h2>
            <Link href="/historico" className="text-xs text-[#C4A882]">Ver todas →</Link>
          </div>
          {loading ? (
            <div className="bg-white border border-[#E8DFD0] rounded-xl p-6 text-center text-sm text-[#6B5A4E]">Carregando...</div>
          ) : sims.length === 0 ? (
            <div className="bg-white border border-[#E8DFD0] rounded-xl p-8 text-center">
              <p className="text-sm text-[#6B5A4E]">Nenhuma simulação ainda.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E8DFD0] rounded-xl overflow-hidden">
              {sims.map((s: any, i: number) => {
                const res = s.resultado as any
                const dt = new Date(s.criadoEm).toLocaleDateString('pt-BR')
                return (
                  <div key={s.id} className={`flex items-center justify-between px-4 py-3 ${i < sims.length-1 ? 'border-b border-[#F0E8DC]' : ''}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2C2520] truncate">{s.produto}</p>
                      <p className="text-xs text-[#6B5A4E] mt-0.5">{dt} · {s.nomeUsuario}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      {res?.areaComPerda && <p className="text-sm font-medium">{res.areaComPerda.toFixed(1)} m²</p>}
                      {res?.totalGeral > 0 && <p className="text-xs text-[#C4A882]">R$ {res.totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return <AuthGuard><DashboardContent /></AuthGuard>
}

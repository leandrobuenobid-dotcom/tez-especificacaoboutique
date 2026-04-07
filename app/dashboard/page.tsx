import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getDB } from '@/lib/db'
import Nav from '@/components/Nav'

const CATS = [
  { id: 'cimento',   nome: 'Cimento Queimado',          icon: '🪣', desc: 'Matte e Lunar' },
  { id: 'cristal',   nome: 'Cristal de Pedras Naturais', icon: '✨', desc: '#10 e #20' },
  { id: 'drenante',  nome: 'Piso Drenante Resinado',     icon: '🌧️', desc: 'Uso externo' },
  { id: 'granulado', nome: 'Granulados',                 icon: '🪨', desc: '9 cores' },
]

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = await getDB()
  const sims = db.simulacoes
    .filter(s => session.perfil === 'admin' ? true : s.boutiqueId === session.boutiqueId)
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .slice(0, 5)
    .map(s => ({
      ...s,
      nomeUsuario: db.usuarios.find(u => u.id === s.usuarioId)?.nome || '—',
    }))

  const totalSims = db.simulacoes.filter(s =>
    session.perfil === 'admin' ? true : s.boutiqueId === session.boutiqueId
  ).length

  return (
    <div className="min-h-screen">
      <Nav nome={session.nome} perfil={session.perfil} boutique={session.boutiqueName} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Boas-vindas */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-[#2C2520]">Olá, {session.nome.split(' ')[0]}.</h1>
          <p className="text-sm text-[#6B5A4E] mt-1">{session.boutiqueName} · {totalSims} simulação{totalSims !== 1 ? 'ões' : ''} realizad{totalSims !== 1 ? 'as' : 'a'}</p>
        </div>

        {/* Botão principal */}
        <Link
          href="/especificacao"
          className="flex items-center justify-between w-full bg-[#2C2520] text-white rounded-xl px-6 py-5 mb-8 hover:bg-[#8B6B4A] transition-colors group"
        >
          <div>
            <p className="text-lg font-medium">Nova especificação</p>
            <p className="text-sm text-white/60 mt-0.5">Calcular quantidade de material</p>
          </div>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        {/* Atalhos por categoria */}
        <div className="mb-8">
          <h2 className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase mb-3">Acesso rápido por produto</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATS.map(cat => (
              <Link
                key={cat.id}
                href={`/especificacao?cat=${cat.id}`}
                className="bg-white border border-[#E8DFD0] rounded-xl p-4 hover:border-[#C4A882] hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-2">{cat.icon}</div>
                <p className="text-sm font-medium text-[#2C2520] leading-tight">{cat.nome}</p>
                <p className="text-xs text-[#6B5A4E] mt-0.5">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Histórico recente */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase">Simulações recentes</h2>
            <Link href="/historico" className="text-xs text-[#C4A882] hover:text-[#8B6B4A]">Ver todas →</Link>
          </div>

          {sims.length === 0 ? (
            <div className="bg-white border border-[#E8DFD0] rounded-xl p-8 text-center">
              <p className="text-sm text-[#6B5A4E]">Nenhuma simulação ainda.</p>
              <p className="text-xs text-[#6B5A4E]/60 mt-1">Faça a primeira especificação agora.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E8DFD0] rounded-xl overflow-hidden">
              {sims.map((s, i) => {
                const res = s.resultado as { areaComPerda?: number; totalGeral?: number }
                const dt = new Date(s.criadoEm).toLocaleDateString('pt-BR')
                return (
                  <div key={s.id} className={`flex items-center justify-between px-4 py-3 ${i < sims.length - 1 ? 'border-b border-[#F0E8DC]' : ''}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2C2520] truncate">{s.produto}</p>
                      <p className="text-xs text-[#6B5A4E] mt-0.5">{dt} · {s.nomeUsuario}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      {res?.areaComPerda && (
                        <p className="text-sm font-medium text-[#2C2520]">{res.areaComPerda.toFixed(1)} m²</p>
                      )}
                      {res?.totalGeral && res.totalGeral > 0 ? (
                        <p className="text-xs text-[#C4A882]">R$ {res.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      ) : (
                        <p className="text-xs text-[#6B5A4E]/50">sem preço</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Stats admin */}
        {session.perfil === 'admin' && (
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: 'Boutiques', val: db.boutiques.filter(b => b.status === 'ativo').length },
              { label: 'Usuários', val: db.usuarios.filter(u => u.status === 'ativo').length },
              { label: 'Simulações', val: db.simulacoes.length },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#E8DFD0] rounded-xl p-4 text-center">
                <p className="text-2xl font-serif text-[#2C2520]">{s.val}</p>
                <p className="text-xs text-[#6B5A4E] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

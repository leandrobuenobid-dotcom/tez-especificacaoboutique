import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDB } from '@/lib/db'
import Nav from '@/components/Nav'

const CAT_LABEL: Record<string, string> = {
  cimento: 'Cimento Queimado', cristal: 'Cristal', drenante: 'Piso Drenante', granulado: 'Granulado'
}

function fmt(v: number) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

export default async function HistoricoPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = await getDB()
  const sims = db.simulacoes
    .filter(s => session.perfil === 'admin' ? true : s.boutiqueId === session.boutiqueId)
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .map(s => ({
      ...s,
      nomeUsuario: db.usuarios.find(u => u.id === s.usuarioId)?.nome || '—',
      nomeBoutique: db.boutiques.find(b => b.id === s.boutiqueId)?.nome || '—',
    }))

  const totalGasto = sims.reduce((acc, s) => {
    const r = s.resultado as { totalGeral?: number }
    return acc + (r?.totalGeral || 0)
  }, 0)

  return (
    <div className="min-h-screen">
      <Nav nome={session.nome} perfil={session.perfil} boutique={session.boutiqueName} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif text-[#2C2520]">Histórico de simulações</h1>
            <p className="text-sm text-[#6B5A4E] mt-1">{sims.length} simulações · {session.perfil === 'admin' ? 'todas as boutiques' : session.boutiqueName}</p>
          </div>
          {totalGasto > 0 && (
            <div className="text-right">
              <p className="text-xs text-[#6B5A4E]">Total especificado</p>
              <p className="text-lg font-serif text-[#2C2520]">{fmt(totalGasto)}</p>
            </div>
          )}
        </div>

        {sims.length === 0 ? (
          <div className="bg-white border border-[#E8DFD0] rounded-xl p-12 text-center">
            <p className="text-[#6B5A4E]">Nenhuma simulação registrada ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sims.map(s => {
              const res = s.resultado as { areaComPerda?: number; totalGeral?: number; itens?: Array<{tipoRelacao?: string; quantidade?: number; unidade?: string}>; entradaSnapshot?: Record<string, string> }
              const principal = res?.itens?.find(i => i.tipoRelacao === 'principal')
              const entrada = res?.entradaSnapshot
              const dt = new Date(s.criadoEm)
              const dtStr = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={s.id} className="bg-white border border-[#E8DFD0] rounded-xl p-4 hover:border-[#C4A882] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-[#F5EFE0] text-[#8B6B4A] px-2 py-0.5 rounded-full font-medium">{CAT_LABEL[s.categoria] || s.categoria}</span>
                        {session.perfil === 'admin' && <span className="text-xs text-[#6B5A4E]">{s.nomeBoutique}</span>}
                      </div>
                      <p className="text-sm font-medium text-[#2C2520] truncate">{principal ? `${s.produto}` : s.produto}</p>
                      <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-[#6B5A4E]">
                        {entrada?.tipoAplicacao && <span>{entrada.tipoAplicacao}</span>}
                        {entrada?.ambiente && <span>{entrada.ambiente}</span>}
                        {entrada?.tipoBase && <span>{entrada.tipoBase}</span>}
                        {entrada?.tipoTrafego && <span>{entrada.tipoTrafego}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex gap-4 mb-1">
                        {res?.areaComPerda && (
                          <div><p className="text-xs text-[#6B5A4E]">Área</p><p className="text-sm font-medium">{res.areaComPerda.toFixed(1)} m²</p></div>
                        )}
                        {principal?.quantidade && (
                          <div><p className="text-xs text-[#6B5A4E]">Qtd</p><p className="text-sm font-medium">{principal.quantidade} {principal.unidade?.split('(')[0].trim()}</p></div>
                        )}
                        {res?.totalGeral && res.totalGeral > 0 && (
                          <div><p className="text-xs text-[#6B5A4E]">Total</p><p className="text-sm font-medium text-[#C4A882]">{fmt(res.totalGeral)}</p></div>
                        )}
                      </div>
                      <p className="text-xs text-[#6B5A4E]/60">{dtStr} · {s.nomeUsuario}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

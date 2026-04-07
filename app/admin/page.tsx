import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDB } from '@/lib/db'
import Nav from '@/components/Nav'
import AdminTabs from './AdminTabs'

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.perfil !== 'admin') redirect('/dashboard')

  const db = await getDB()

  const dados = {
    boutiques: db.boutiques.map(b => ({
      ...b,
      totalUsuarios: db.usuarios.filter(u => u.boutiqueId === b.id).length,
      totalSimulacoes: db.simulacoes.filter(s => s.boutiqueId === b.id).length,
    })),
    usuarios: db.usuarios.map(({ senhaHash: _, ...u }) => ({
      ...u,
      boutiqueName: db.boutiques.find(b => b.id === u.boutiqueId)?.nome || '—',
    })),
    produtos: db.produtos,
    stats: {
      totalSimulacoes: db.simulacoes.length,
      totalBoutiques: db.boutiques.filter(b => b.status === 'ativo').length,
      totalUsuarios: db.usuarios.filter(u => u.status === 'ativo').length,
      totalProdutos: db.produtos.filter(p => p.ativo && p.categoriaId !== 'complementar').length,
    }
  }

  return (
    <div className="min-h-screen">
      <Nav nome={session.nome} perfil={session.perfil} boutique={session.boutiqueName} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#2C2520]">Painel Admin</h1>
          <p className="text-sm text-[#6B5A4E] mt-1">Gestão completa da plataforma Tez</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Simulações', val: dados.stats.totalSimulacoes },
            { label: 'Boutiques ativas', val: dados.stats.totalBoutiques },
            { label: 'Usuários ativos', val: dados.stats.totalUsuarios },
            { label: 'Produtos ativos', val: dados.stats.totalProdutos },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E8DFD0] rounded-xl p-4 text-center">
              <p className="text-2xl font-serif text-[#2C2520]">{s.val}</p>
              <p className="text-xs text-[#6B5A4E] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <AdminTabs dados={dados} />
      </main>
    </div>
  )
}

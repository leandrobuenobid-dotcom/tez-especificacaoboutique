'use client'
import { useEffect, useState } from 'react'
import AuthGuard, { authFetch } from '@/components/AuthGuard'
import Nav from '@/components/Nav'
import AdminTabs from './AdminTabs'

function AdminContent() {
  const [dados, setDados] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      authFetch('/api/admin/boutiques').then(r=>r.json()),
      authFetch('/api/admin/usuarios').then(r=>r.json()),
      authFetch('/api/admin/produtos').then(r=>r.json()),
    ]).then(([b,u,p]) => {
      setDados({
        boutiques: b.boutiques||[],
        usuarios: u.usuarios||[],
        produtos: p.produtos||[],
        stats: {
          totalBoutiques: (b.boutiques||[]).length,
          totalUsuarios: (u.usuarios||[]).length,
          totalProdutos: (p.produtos||[]).filter((x:any)=>x.categoriaId!=='complementar').length,
        }
      })
    })
  }, [])

  if (!dados) return <div className="flex items-center justify-center py-20 text-sm text-[#6B5A4E]">Carregando...</div>

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#2C2520]">Painel Admin</h1>
          <p className="text-sm text-[#6B5A4E] mt-1">Gestão completa da plataforma Tez</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[{label:'Boutiques',val:dados.stats.totalBoutiques},{label:'Usuários',val:dados.stats.totalUsuarios},{label:'Produtos',val:dados.stats.totalProdutos}].map(s=>(
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

export default function AdminPage() {
  return <AuthGuard adminOnly><AdminContent /></AuthGuard>
}

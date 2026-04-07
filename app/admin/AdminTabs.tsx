'use client'
import { useState } from 'react'
import { authFetch } from '@/components/AuthGuard'

interface Boutique { id: string; nome: string; cidade: string; estado: string; status: string; totalUsuarios: number; totalSimulacoes: number }
interface Usuario { id: string; boutiqueId: string; nome: string; email: string; perfil: string; status: string; boutiqueName: string }
interface Produto { id: string; categoriaId: string; sku: string; nome: string; linha?: string; cor?: string; granulometria?: string; unidadeVenda: string; pesoEmbalagem: number; ativo: boolean }

interface Props {
  dados: {
    boutiques: Boutique[]
    usuarios: Usuario[]
    produtos: Produto[]
    stats: Record<string, number>
  }
}

const CAT_LABEL: Record<string, string> = {
  cimento: 'Cimento', cristal: 'Cristal', drenante: 'Drenante', granulado: 'Granulado', complementar: 'Complementar'
}
const PERFIL_COR: Record<string, string> = {
  admin: 'bg-red-50 text-red-700 border-red-200',
  gerente: 'bg-blue-50 text-blue-700 border-blue-200',
  vendedor: 'bg-green-50 text-green-700 border-green-200',
}

export default function AdminTabs({ dados }: Props) {
  const [tab, setTab] = useState<'boutiques' | 'usuarios' | 'produtos'>('boutiques')
  const [showFormBoutique, setShowFormBoutique] = useState(false)
  const [showFormUsuario, setShowFormUsuario] = useState(false)
  const [formB, setFormB] = useState({ nome: '', cidade: '', estado: '' })
  const [formU, setFormU] = useState({ nome: '', email: '', senha: '', perfil: 'vendedor', boutiqueId: '' })
  const [salvando, setSalvando] = useState(false)
  const [boutiques, setBoutiques] = useState(dados.boutiques)
  const [usuarios, setUsuarios] = useState(dados.usuarios)
  const [msg, setMsg] = useState('')

  const tabs = [
    { id: 'boutiques' as const, label: 'Boutiques', count: boutiques.length },
    { id: 'usuarios' as const, label: 'Usuários', count: usuarios.length },
    { id: 'produtos' as const, label: 'Produtos', count: dados.produtos.filter(p => p.categoriaId !== 'complementar').length },
  ]

  async function salvarBoutique() {
    if (!formB.nome) return
    setSalvando(true)
    const res = await authFetch('/api/admin/boutiques', { method: 'POST', body: JSON.stringify(formB) })
    const data = await res.json()
    if (res.ok) {
      setBoutiques(prev => [...prev, { ...data.boutique, totalUsuarios: 0, totalSimulacoes: 0 }])
      setFormB({ nome: '', cidade: '', estado: '' }); setShowFormBoutique(false)
      setMsg('Boutique criada com sucesso.')
    } else setMsg(data.erro || 'Erro ao criar boutique.')
    setSalvando(false); setTimeout(() => setMsg(''), 3000)
  }

  async function salvarUsuario() {
    if (!formU.nome || !formU.email || !formU.senha || !formU.boutiqueId) { setMsg('Preencha todos os campos.'); return }
    setSalvando(true)
    const res = await authFetch('/api/admin/usuarios', { method: 'POST', body: JSON.stringify(formU) })
    const data = await res.json()
    if (res.ok) {
      setUsuarios(prev => [...prev, { ...data.usuario, boutiqueName: boutiques.find(b => b.id === formU.boutiqueId)?.nome || '—' }])
      setFormU({ nome: '', email: '', senha: '', perfil: 'vendedor', boutiqueId: '' }); setShowFormUsuario(false)
      setMsg('Usuário criado com sucesso.')
    } else setMsg(data.erro || 'Erro ao criar usuário.')
    setSalvando(false); setTimeout(() => setMsg(''), 3000)
  }

  const inputCls = "w-full px-3 py-2 border border-[#E8DFD0] rounded-lg text-sm focus:outline-none focus:border-[#C4A882]"
  const labelCls = "block text-xs font-medium text-[#6B5A4E] tracking-wider uppercase mb-1"

  return (
    <div>
      {msg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{msg}</div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-white border border-[#E8DFD0] rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm transition-colors ${tab === t.id ? 'bg-[#2C2520] text-white' : 'text-[#6B5A4E] hover:text-[#2C2520]'}`}>
            {t.label} <span className={`ml-1 text-xs ${tab === t.id ? 'text-white/60' : 'text-[#6B5A4E]/50'}`}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* ── BOUTIQUES ─────────────────────────────────────────────── */}
      {tab === 'boutiques' && (
        <div>
          <div className="flex justify-end mb-3">
            <button onClick={() => setShowFormBoutique(v => !v)}
              className="px-4 py-2 bg-[#2C2520] text-white rounded-lg text-sm hover:bg-[#8B6B4A] transition-colors">
              + Nova boutique
            </button>
          </div>

          {showFormBoutique && (
            <div className="bg-white border border-[#E8DFD0] rounded-xl p-5 mb-4">
              <h3 className="text-sm font-medium text-[#2C2520] mb-4">Nova boutique</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div><label className={labelCls}>Nome</label><input className={inputCls} value={formB.nome} onChange={e => setFormB(f => ({ ...f, nome: e.target.value }))} placeholder="Nome da boutique" /></div>
                <div><label className={labelCls}>Cidade</label><input className={inputCls} value={formB.cidade} onChange={e => setFormB(f => ({ ...f, cidade: e.target.value }))} placeholder="Goiânia" /></div>
                <div><label className={labelCls}>Estado</label><input className={inputCls} value={formB.estado} onChange={e => setFormB(f => ({ ...f, estado: e.target.value }))} placeholder="GO" maxLength={2} /></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowFormBoutique(false)} className="px-4 py-2 border border-[#E8DFD0] rounded-lg text-sm text-[#6B5A4E]">Cancelar</button>
                <button onClick={salvarBoutique} disabled={salvando} className="px-4 py-2 bg-[#2C2520] text-white rounded-lg text-sm disabled:opacity-50">
                  {salvando ? 'Salvando...' : 'Criar boutique'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {boutiques.map(b => (
              <div key={b.id} className="bg-white border border-[#E8DFD0] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#2C2520]">{b.nome}</p>
                  <p className="text-xs text-[#6B5A4E] mt-0.5">{b.cidade}{b.cidade && b.estado ? ', ' : ''}{b.estado}</p>
                </div>
                <div className="flex gap-4 text-right">
                  <div><p className="text-sm font-medium">{b.totalUsuarios}</p><p className="text-xs text-[#6B5A4E]">usuários</p></div>
                  <div><p className="text-sm font-medium">{b.totalSimulacoes}</p><p className="text-xs text-[#6B5A4E]">simulações</p></div>
                  <span className={`self-center text-xs px-2 py-0.5 rounded-full border ${b.status==='ativo'?'bg-green-50 text-green-700 border-green-200':'bg-gray-50 text-gray-500 border-gray-200'}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USUÁRIOS ──────────────────────────────────────────────── */}
      {tab === 'usuarios' && (
        <div>
          <div className="flex justify-end mb-3">
            <button onClick={() => setShowFormUsuario(v => !v)}
              className="px-4 py-2 bg-[#2C2520] text-white rounded-lg text-sm hover:bg-[#8B6B4A] transition-colors">
              + Novo usuário
            </button>
          </div>

          {showFormUsuario && (
            <div className="bg-white border border-[#E8DFD0] rounded-xl p-5 mb-4">
              <h3 className="text-sm font-medium text-[#2C2520] mb-4">Novo usuário</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div><label className={labelCls}>Nome</label><input className={inputCls} value={formU.nome} onChange={e => setFormU(f => ({ ...f, nome: e.target.value }))} /></div>
                <div><label className={labelCls}>E-mail</label><input type="email" className={inputCls} value={formU.email} onChange={e => setFormU(f => ({ ...f, email: e.target.value }))} /></div>
                <div><label className={labelCls}>Senha inicial</label><input type="password" className={inputCls} value={formU.senha} onChange={e => setFormU(f => ({ ...f, senha: e.target.value }))} /></div>
                <div>
                  <label className={labelCls}>Perfil</label>
                  <select className={inputCls} value={formU.perfil} onChange={e => setFormU(f => ({ ...f, perfil: e.target.value }))}>
                    <option value="vendedor">Vendedor</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Boutique</label>
                  <select className={inputCls} value={formU.boutiqueId} onChange={e => setFormU(f => ({ ...f, boutiqueId: e.target.value }))}>
                    <option value="">Selecione a boutique...</option>
                    {boutiques.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowFormUsuario(false)} className="px-4 py-2 border border-[#E8DFD0] rounded-lg text-sm text-[#6B5A4E]">Cancelar</button>
                <button onClick={salvarUsuario} disabled={salvando} className="px-4 py-2 bg-[#2C2520] text-white rounded-lg text-sm disabled:opacity-50">
                  {salvando ? 'Salvando...' : 'Criar usuário'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {usuarios.map(u => (
              <div key={u.id} className="bg-white border border-[#E8DFD0] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#2C2520]">{u.nome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${PERFIL_COR[u.perfil] || ''}`}>{u.perfil}</span>
                  </div>
                  <p className="text-xs text-[#6B5A4E] mt-0.5">{u.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6B5A4E]">{u.boutiqueName}</p>
                  <span className={`text-xs ${u.status==='ativo'?'text-green-600':'text-gray-400'}`}>{u.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PRODUTOS ──────────────────────────────────────────────── */}
      {tab === 'produtos' && (
        <div>
          <div className="bg-[#F5EFE0] border border-[#E8DFD0] rounded-xl p-4 mb-4 text-xs text-[#6B5A4E]">
            Os produtos e regras de cálculo são gerenciados via API. Em breve: editor visual de regras e SKUs.
          </div>
          <div className="space-y-2">
            {dados.produtos.filter(p => p.categoriaId !== 'complementar').map(p => (
              <div key={p.id} className="bg-white border border-[#E8DFD0] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs bg-[#F5EFE0] text-[#8B6B4A] px-2 py-0.5 rounded-full">{CAT_LABEL[p.categoriaId]}</span>
                    <span className="text-xs text-[#6B5A4E] font-mono">{p.sku}</span>
                  </div>
                  <p className="text-sm font-medium text-[#2C2520]">{p.nome}</p>
                  {(p.linha || p.granulometria) && (
                    <p className="text-xs text-[#6B5A4E] mt-0.5">{[p.linha, p.granulometria].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{p.pesoEmbalagem} kg</p>
                  <p className="text-xs text-[#6B5A4E]">{p.unidadeVenda}</p>
                  <span className={`text-xs ${p.ativo?'text-green-600':'text-gray-400'}`}>{p.ativo?'ativo':'inativo'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

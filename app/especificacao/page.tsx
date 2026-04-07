'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'

// ─── Dados de catálogo ───────────────────────────────────────────────────────
const CATS = [
  { id: 'cimento',   nome: 'Cimento Queimado',           icon: '🪣', desc: 'Matte e Lunar' },
  { id: 'cristal',   nome: 'Cristal de Pedras Naturais',  icon: '✨', desc: '#10 e #20' },
  { id: 'drenante',  nome: 'Piso Drenante Resinado',      icon: '🌧️', desc: 'Uso externo' },
  { id: 'granulado', nome: 'Granulados',                  icon: '🪨', desc: '9 cores' },
]

const CORES_MATTE  = ['Branco Neve','Cinza Claro','Cinza Médio','Cinza Escuro','Antracite','Terracota','Areia','Cru','Preto','Off-White']
const CORES_LUNAR  = ['Prata','Champagne','Rosé Gold','Bronze','Cobre','Nude Perolado','Branco Perolado','Grafite Perolado']
const CORES_CRISTAL = ['Maldivas','Dubai','Trancoso','Rio','Grécia','Mykonos','Madri','Pompéia','Marrocos','Pedra Ferro','Hitam','Dubai Preto','Berilo','Vulcano','Parise Black','Marroquito','Dunas','Full Gray','Grigio','Hágata','Dubai Red']
const GRAN_POR_COR: Record<string, string[]> = {
  'Maldivas':['#10','#20'],'Dubai':['#10','#20'],'Trancoso':['#20'],'Rio':['#20'],
  'Grécia':['#10','#20'],'Mykonos':['#10','#20'],'Madri':['#10','#20'],
  'Pompéia':['#10'],'Marrocos':['#10'],'Pedra Ferro':['#10','#20'],
  'Hitam':['#10','#20'],'Dubai Preto':['#10','#20'],'Berilo':['#20'],
  'Vulcano':['#10','#20'],'Parise Black':['#10','#20'],'Marroquito':['#20'],
  'Dunas':['#10','#20'],'Full Gray':['#10','#20'],'Grigio':['#20'],
  'Hágata':['#20'],'Dubai Red':['#10'],
}
const CORES_DRENANTE = ['Poseidon','Lago Tahoe','Palácio','Ponte do Gard','Ipanema','Capela Sistina','Versalhes','Toscana','Ilha Ellis','Key West','Coral Springs','Seixo Cinza','Pérola','Gema Negra','Platina']
const CORES_GRANULADO = ['Papel Picado','Nevada','Gelo Seco','Areia','Marfim','Capuccino','Cinza Claro','Cinza Elefante','Carbono']

const PERDA_PRESETS = [[5,'Parede simples'],[8,'Piso interno'],[10,'Piso externo'],[12,'Com recorte'],[15,'Paginação complexa']] as const

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface ItemResultado {
  nome: string; sku?: string; quantidade: number; unidade: string
  tipoRelacao?: string; precoUnit?: number; subtotal?: number; observacao?: string
}
interface Resultado {
  areaLiquida: number; perdaAplicada: number; areaComPerda: number
  itens: ItemResultado[]; alertas: string[]; totalGeral: number
}

function fmt(v: number) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Componente principal ────────────────────────────────────────────────────
function EspecificacaoInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Sessão (lida via cookie já pelo middleware — buscamos via API)
  const [session, setSession] = useState<{ nome: string; perfil: string; boutiqueName: string } | null>(null)

  const [step, setStep] = useState(1)
  const [cat, setCat] = useState(searchParams.get('cat') || '')
  const [linha, setLinha] = useState('')
  const [cor, setCor] = useState('')
  const [gran, setGran] = useState('')
  const [tipoApl, setTipoApl] = useState('')
  const [ambiente, setAmbiente] = useState('')
  const [tipoBase, setTipoBase] = useState('')
  const [tipoTrafego, setTipoTrafego] = useState('')
  const [area, setArea] = useState('')
  const [largura, setLargura] = useState('')
  const [comprimento, setComprimento] = useState('')
  const [perda, setPerda] = useState(8)
  const [usarPrimer, setUsarPrimer] = useState(true)
  const [usarFundo, setUsarFundo] = useState(true)
  const [usarTela, setUsarTela] = useState(true)
  const [precos, setPrecos] = useState<Record<string, number>>({})
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setSession(d.usuario)).catch(() => {})
    if (searchParams.get('cat')) setStep(2)
  }, [])

  function calcAreaAuto() {
    const l = parseFloat(largura), c = parseFloat(comprimento)
    if (l > 0 && c > 0) setArea(String(+(l * c).toFixed(2)))
  }

  function passo2Pronto() {
    if (cat === 'cimento') return !!(linha && cor && tipoApl && ambiente)
    if (cat === 'cristal') return !!(cor && gran)
    if (cat === 'drenante') {
      if (tipoBase === 'Solo Natural' && tipoTrafego === 'Tráfego Pesado') return false
      return !!(cor && tipoBase && tipoTrafego)
    }
    if (cat === 'granulado') return !!cor
    return false
  }

  async function calcular() {
    const areaNum = parseFloat(area)
    if (!areaNum || areaNum <= 0) { alert('Informe a área do projeto.'); return }

    const entrada = {
      categoriaId: cat, cor, linha, granulometria: gran,
      tipoAplicacao: tipoApl, ambiente, tipoBase, tipoTrafego,
      area: areaNum, perda,
      usarPrimer, usarFundo, usarTela, precos,
    }

    const res = await fetch('/api/simulacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entrada),
    })
    const data = await res.json()
    if (res.ok) {
      setResultado(data.simulacao.resultado)
      setSalvo(true)
      setStep(4)
    } else {
      alert(data.erro || 'Erro ao calcular.')
    }
  }

  function gerarTexto() {
    if (!resultado) return ''
    const linhas = []
    const d = new Date().toLocaleDateString('pt-BR')
    const principal = resultado.itens.find(i => i.tipoRelacao === 'principal')
    linhas.push(`ESPECIFICAÇÃO TEZ — ${d}`)
    linhas.push('─'.repeat(40))
    if (principal) linhas.push(`Produto: ${principal.nome}`)
    if (tipoApl) linhas.push(`Aplicação: ${tipoApl}`)
    if (ambiente) linhas.push(`Ambiente: ${ambiente}`)
    if (tipoBase) linhas.push(`Base: ${tipoBase}`)
    if (tipoTrafego) linhas.push(`Tráfego: ${tipoTrafego}`)
    linhas.push(`Área: ${resultado.areaLiquida.toFixed(1)} m² · Perda: ${resultado.perdaAplicada}% · Com perda: ${resultado.areaComPerda.toFixed(1)} m²`)
    linhas.push('')
    linhas.push('MATERIAIS')
    resultado.itens.filter(i => i.quantidade > 0).forEach(i => {
      let l = `  • ${i.nome}: ${i.quantidade} ${i.unidade}`
      if (i.precoUnit && i.precoUnit > 0) l += ` — ${fmt(i.precoUnit)} un = ${fmt(i.subtotal || 0)}`
      linhas.push(l)
    })
    if (resultado.totalGeral > 0) { linhas.push(''); linhas.push(`TOTAL ESTIMADO: ${fmt(resultado.totalGeral)}`) }
    if (resultado.alertas.length) { linhas.push(''); linhas.push('OBSERVAÇÕES'); resultado.alertas.slice(0,3).forEach(a => linhas.push(`  • ${a}`)) }
    linhas.push(''); linhas.push('Cálculo teórico baseado nas regras Tez.')
    return linhas.join('\n')
  }

  function copiar() {
    navigator.clipboard.writeText(gerarTexto()).then(() => {
      setCopiado(true); setTimeout(() => setCopiado(false), 2000)
    })
  }

  function nova() {
    setCat(''); setLinha(''); setCor(''); setGran(''); setTipoApl(''); setAmbiente('')
    setTipoBase(''); setTipoTrafego(''); setArea(''); setLargura(''); setComprimento('')
    setPerda(8); setPrecos({}); setResultado(null); setSalvo(false); setStep(1)
    router.push('/especificacao')
  }

  // ── UI helpers ──────────────────────────────────────────────────────────────
  const radioBtn = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${active ? 'bg-[#2C2520] border-[#2C2520] text-white' : 'border-[#E8DFD0] text-[#6B5A4E] hover:border-[#C4A882]'}`}>
      {label}
    </button>
  )

  const fieldLabel = (text: string) => (
    <label className="block text-xs font-medium text-[#6B5A4E] tracking-wider uppercase mb-1.5">{text}</label>
  )

  const selectEl = (value: string, onChange: (v: string) => void, opts: string[], placeholder = 'Selecione...') => (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 border border-[#E8DFD0] rounded-lg text-sm text-[#2C2520] bg-white focus:outline-none focus:border-[#C4A882] appearance-none">
      <option value="">{placeholder}</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  const precoInput = (label: string, key: string) => (
    <div key={key} className="bg-white border border-[#E8DFD0] rounded-lg p-3">
      <label className="block text-xs text-[#6B5A4E] mb-1.5">{label}</label>
      <div className="flex items-center gap-1">
        <span className="text-xs text-[#6B5A4E]">R$</span>
        <input type="number" min={0} step={0.01} placeholder="0,00"
          value={precos[key] || ''}
          onChange={e => setPrecos(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
          className="w-full text-sm text-[#2C2520] outline-none bg-transparent" />
      </div>
    </div>
  )

  const navBar = (
    <div className="flex gap-1 mb-6 overflow-x-auto">
      {['Categoria','Produto','Medidas','Resultado'].map((l, i) => (
        <div key={l} className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => { if (i + 1 < step) setStep(i + 1) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${step === i+1 ? 'bg-[#2C2520] text-white' : step > i+1 ? 'text-[#C4A882] cursor-pointer' : 'text-[#6B5A4E]/40'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${step === i+1 ? 'bg-white/20' : step > i+1 ? 'bg-[#C4A882]/20' : 'bg-[#E8DFD0]'}`}>{i+1}</span>
            {l}
          </button>
          {i < 3 && <span className="text-[#E8DFD0]">›</span>}
        </div>
      ))}
    </div>
  )

  // ── STEP 1 — Categoria ──────────────────────────────────────────────────────
  if (step === 1) return (
    <div>
      {navBar}
      <h2 className="text-xl font-serif text-[#2C2520] mb-1">Selecione a categoria</h2>
      <p className="text-sm text-[#6B5A4E] mb-6">Qual produto será especificado?</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {CATS.map(c => (
          <button key={c.id} onClick={() => { setCat(c.id); setCor(''); setLinha(''); setGran('') }}
            className={`text-left p-4 rounded-xl border transition-all ${cat === c.id ? 'border-[#D4875A] bg-[#FDF5EE]' : 'border-[#E8DFD0] bg-white hover:border-[#C4A882]'}`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className="text-sm font-medium text-[#2C2520]">{c.nome}</p>
            <p className="text-xs text-[#6B5A4E] mt-0.5">{c.desc}</p>
          </button>
        ))}
      </div>
      <button onClick={() => cat && setStep(2)} disabled={!cat}
        className="w-full py-3 bg-[#2C2520] text-white rounded-xl text-sm font-medium hover:bg-[#8B6B4A] transition-colors disabled:opacity-40">
        Continuar →
      </button>
    </div>
  )

  // ── STEP 2 — Produto ────────────────────────────────────────────────────────
  if (step === 2) return (
    <div>
      {navBar}
      <h2 className="text-xl font-serif text-[#2C2520] mb-1">{CATS.find(c => c.id === cat)?.nome}</h2>
      <p className="text-sm text-[#6B5A4E] mb-6">Configure o produto</p>

      {cat === 'cimento' && (
        <div className="space-y-4">
          <div>{fieldLabel('Linha')}<div className="flex gap-2">{['Matte','Lunar'].map(l => radioBtn(l, linha===l, () => { setLinha(l); setCor(''); setTipoApl(l==='Lunar'?'Parede/Teto':''); setAmbiente(l==='Lunar'?'Interno':'') }))}</div></div>
          {linha && <>
            <div>{fieldLabel('Cor')}{selectEl(cor, setCor, linha==='Matte'?CORES_MATTE:CORES_LUNAR)}</div>
            <div>
              {fieldLabel('Tipo de aplicação')}
              <div className="flex flex-wrap gap-2">
                {(linha==='Matte'?['Parede/Teto','Porta de Madeira','Movelaria']:['Parede/Teto']).map(t => radioBtn(t, tipoApl===t, () => setTipoApl(t)))}
              </div>
              {linha==='Lunar' && <p className="text-xs text-blue-600 mt-1.5">Linha Lunar: apenas paredes e tetos internos.</p>}
            </div>
            <div>
              {fieldLabel('Ambiente')}
              <div className="flex gap-2">
                {(linha==='Lunar'?['Interno']:['Interno','Externo']).map(a => radioBtn(a, ambiente===a, () => setAmbiente(a)))}
              </div>
            </div>
          </>}
        </div>
      )}

      {cat === 'cristal' && (
        <div className="space-y-4">
          <div>{fieldLabel('Cor / Referência')}{selectEl(cor, v => { setCor(v); const g = GRAN_POR_COR[v]||[]; setGran(g.length===1?g[0]:'') }, CORES_CRISTAL)}</div>
          {cor && (
            <div>
              {fieldLabel('Granulometria')}
              <div className="flex gap-2">{(GRAN_POR_COR[cor]||['#10','#20']).map(g => radioBtn(g, gran===g, () => setGran(g)))}</div>
              <p className="text-xs text-[#6B5A4E] mt-1.5">#20 = 3,83 kg/m² · ~6 m²/balde&nbsp;&nbsp;|&nbsp;&nbsp;#10 = 5 kg/m² · ~4,5 m²/balde</p>
            </div>
          )}
          <div>
            {fieldLabel('Complementares')}
            <div className="flex gap-2">
              {radioBtn('Primer Cristal', usarPrimer, () => setUsarPrimer(v => !v))}
              {radioBtn('Fundo Preparador', usarFundo, () => setUsarFundo(v => !v))}
            </div>
          </div>
        </div>
      )}

      {cat === 'drenante' && (
        <div className="space-y-4">
          <div>{fieldLabel('Cor / Mistura')}{selectEl(cor, setCor, CORES_DRENANTE)}</div>
          <div>
            {fieldLabel('Tipo de base')}
            <div className="flex flex-wrap gap-2">{['Solo Natural','Contrapiso','Concreto Drenante'].map(b => radioBtn(b, tipoBase===b, () => setTipoBase(b)))}</div>
          </div>
          <div>
            {fieldLabel('Tipo de tráfego')}
            <div className="flex flex-wrap gap-2">{['Pedestres','Veículos Leves','Tráfego Pesado'].map(t => radioBtn(t, tipoTrafego===t, () => setTipoTrafego(t)))}</div>
          </div>
          {tipoBase==='Solo Natural' && tipoTrafego==='Tráfego Pesado' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              Combinação não recomendada. Consulte o suporte técnico Tez.
            </div>
          )}
          <div>
            {fieldLabel('Complementares')}
            <div className="flex gap-2">
              {radioBtn('Primer PU', usarPrimer, () => setUsarPrimer(v => !v))}
              {radioBtn('Tela de Fibra', usarTela, () => setUsarTela(v => !v))}
            </div>
          </div>
        </div>
      )}

      {cat === 'granulado' && (
        <div className="space-y-4">
          <div className="p-3 bg-[#F5EFE0] border border-[#E8DFD0] rounded-lg text-xs text-[#6B5A4E]">
            Consumo: 8 kg/m² · Embalagem: balde 23 kg · Uso interno e externo
          </div>
          <div>{fieldLabel('Cor')}{selectEl(cor, setCor, CORES_GRANULADO)}</div>
          <div>
            {fieldLabel('Incluir primer')}
            <div className="flex gap-2">
              {radioBtn('Sim', usarPrimer, () => setUsarPrimer(true))}
              {radioBtn('Não', !usarPrimer, () => setUsarPrimer(false))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={() => setStep(1)} className="px-4 py-2.5 border border-[#E8DFD0] rounded-xl text-sm text-[#6B5A4E] hover:border-[#C4A882] transition-colors">← Voltar</button>
        <button onClick={() => passo2Pronto() && setStep(3)} disabled={!passo2Pronto()}
          className="flex-1 py-2.5 bg-[#2C2520] text-white rounded-xl text-sm font-medium hover:bg-[#8B6B4A] transition-colors disabled:opacity-40">
          Continuar →
        </button>
      </div>
    </div>
  )

  // ── STEP 3 — Medidas ────────────────────────────────────────────────────────
  if (step === 3) return (
    <div>
      {navBar}
      <h2 className="text-xl font-serif text-[#2C2520] mb-1">Medidas e preços</h2>
      <p className="text-sm text-[#6B5A4E] mb-6">Informe as dimensões e preços unitários</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            {fieldLabel('Largura (m)')}
            <input type="number" min={0.1} step={0.1} placeholder="0,00" value={largura}
              onChange={e => { setLargura(e.target.value); setTimeout(calcAreaAuto, 50) }}
              className="w-full px-3 py-2.5 border border-[#E8DFD0] rounded-lg text-sm focus:outline-none focus:border-[#C4A882]" />
          </div>
          <div>
            {fieldLabel('Comprimento (m)')}
            <input type="number" min={0.1} step={0.1} placeholder="0,00" value={comprimento}
              onChange={e => { setComprimento(e.target.value); setTimeout(calcAreaAuto, 50) }}
              className="w-full px-3 py-2.5 border border-[#E8DFD0] rounded-lg text-sm focus:outline-none focus:border-[#C4A882]" />
          </div>
        </div>

        <div>
          {fieldLabel('Ou área total (m²)')}
          <input type="number" min={0.1} step={0.1} placeholder="0,00" value={area}
            onChange={e => { setArea(e.target.value); setLargura(''); setComprimento('') }}
            className="w-full px-3 py-2.5 border border-[#E8DFD0] rounded-lg text-sm focus:outline-none focus:border-[#C4A882]" />
        </div>

        <div>
          {fieldLabel(`Fator de perda — ${perda}%`)}
          <input type="range" min={0} max={20} step={1} value={perda}
            onChange={e => setPerda(parseInt(e.target.value))}
            className="w-full" />
          <div className="flex flex-wrap gap-x-3 mt-1">
            {PERDA_PRESETS.map(([v, n]) => (
              <button key={v} onClick={() => setPerda(Number(v))}
                className={`text-xs mt-1 ${perda === Number(v) ? 'text-[#D4875A] font-medium' : 'text-[#6B5A4E]'}`}>
                {v}% {n}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#E8DFD0] pt-4">
          <p className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase mb-3">Preços unitários (opcional)</p>
          <div className="grid grid-cols-2 gap-2">
            {cat === 'cimento' && <>{precoInput('Cimento Queimado (balde)', 'principal')}{precoInput('Primer','primer')}{precoInput('Cera Acrílica','cera')}</>}
            {cat === 'cristal' && <>{precoInput('Cristal (balde 23 kg)','principal')}{usarPrimer && precoInput('Primer Cristal','primer')}{usarFundo && precoInput('Fundo Preparador','fundo')}</>}
            {cat === 'drenante' && <>{precoInput('Piso Drenante (kit 16 kg)','principal')}{usarPrimer && precoInput('Primer PU (4 kg)','primer')}{usarTela && precoInput('Tela de Fibra (rolo)','tela')}</>}
            {cat === 'granulado' && <>{precoInput('Granulado (balde 23 kg)','principal')}{usarPrimer && precoInput('Primer','primer')}</>}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={() => setStep(2)} className="px-4 py-2.5 border border-[#E8DFD0] rounded-xl text-sm text-[#6B5A4E] hover:border-[#C4A882] transition-colors">← Voltar</button>
        <button onClick={calcular}
          className="flex-1 py-2.5 bg-[#2C2520] text-white rounded-xl text-sm font-medium hover:bg-[#8B6B4A] transition-colors">
          Calcular →
        </button>
      </div>
    </div>
  )

  // ── STEP 4 — Resultado ──────────────────────────────────────────────────────
  if (step === 4 && resultado) {
    const principal = resultado.itens.find(i => i.tipoRelacao === 'principal')
    const compComQtd = resultado.itens.filter(i => i.tipoRelacao !== 'principal' && i.quantidade > 0)
    const compSemQtd = resultado.itens.filter(i => i.tipoRelacao !== 'principal' && i.quantidade === 0)

    return (
      <div>
        {navBar}
        <h2 className="text-xl font-serif text-[#2C2520] mb-1">Resultado</h2>
        <p className="text-sm text-[#6B5A4E] mb-5">{CATS.find(c => c.id === cat)?.nome}</p>

        {/* Card principal */}
        <div className="bg-white border border-[#E8DFD0] rounded-xl overflow-hidden mb-3">
          <div className="bg-[#2C2520] px-4 py-3">
            <p className="text-sm font-medium text-[#C4A882]">{principal?.nome}</p>
          </div>
          <div className="divide-y divide-[#F0E8DC]">
            {[
              ['Área informada', `${resultado.areaLiquida.toFixed(1)} m²`],
              ['Fator de perda', `${resultado.perdaAplicada}%`],
              ['Área com perda', `${resultado.areaComPerda.toFixed(1)} m²`],
              ['Consumo', principal?.observacao || ''],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-[#6B5A4E]">{l}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-[#6B5A4E]">Quantidade recomendada</span>
              <div className="text-right">
                <span className="bg-[#FDF5EE] text-[#D4875A] font-medium text-sm px-3 py-1 rounded-lg">
                  {principal?.quantidade} {principal?.unidade}
                </span>
                {principal?.precoUnit && principal.precoUnit > 0 && (
                  <p className="text-xs text-[#6B5A4E] mt-1">{fmt(principal.precoUnit)} un · <strong>{fmt(principal.subtotal || 0)}</strong></p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Complementares com quantidade */}
        {compComQtd.length > 0 && (
          <div className="bg-white border border-[#E8DFD0] rounded-xl overflow-hidden mb-3">
            <div className="bg-[#F5EFE0] px-4 py-2.5">
              <p className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase">Complementares</p>
            </div>
            <div className="divide-y divide-[#F0E8DC]">
              {compComQtd.map(item => (
                <div key={item.nome} className="flex justify-between items-center px-4 py-2.5">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${item.tipoRelacao==='obrigatorio'?'bg-red-50 text-red-700 border border-red-200':'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {item.tipoRelacao}
                    </span>
                    <span className="text-sm text-[#2C2520]">{item.nome}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.quantidade} {item.unidade}</p>
                    {item.precoUnit && item.precoUnit > 0 && (
                      <p className="text-xs text-[#6B5A4E]">{fmt(item.precoUnit)} · <strong>{fmt(item.subtotal||0)}</strong></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complementares sem quantidade (só observação) */}
        {compSemQtd.length > 0 && (
          <div className="bg-white border border-[#E8DFD0] rounded-xl overflow-hidden mb-3">
            <div className="divide-y divide-[#F0E8DC]">
              {compSemQtd.map(item => (
                <div key={item.nome} className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-sm text-[#2C2520]">{item.nome}</span>
                  <span className="text-xs text-[#6B5A4E]">{item.observacao}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        {resultado.totalGeral > 0 && (
          <div className="bg-[#2C2520] rounded-xl px-5 py-4 flex justify-between items-center mb-3">
            <span className="text-sm text-[#C4A882]">Total estimado</span>
            <span className="text-xl font-serif text-white">{fmt(resultado.totalGeral)}</span>
          </div>
        )}

        {/* Alertas */}
        {resultado.alertas.length > 0 && (
          <div className="space-y-2 mb-4">
            {resultado.alertas.map((a, i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
                {a}
              </div>
            ))}
          </div>
        )}

        {/* Resumo exportável */}
        <div className="mb-4">
          <p className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase mb-2">Resumo para orçamento</p>
          <pre className="bg-[#2C2520] text-[#C4A882] rounded-xl p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
            {gerarTexto()}
          </pre>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button onClick={copiar} className="py-2.5 border border-[#E8DFD0] rounded-xl text-xs text-[#2C2520] bg-white hover:bg-[#FDF5EE] transition-colors">
            {copiado ? '✓ Copiado' : '📋 Copiar'}
          </button>
          <button onClick={() => window.print()} className="py-2.5 border border-[#E8DFD0] rounded-xl text-xs text-[#2C2520] bg-white hover:bg-[#FDF5EE] transition-colors">
            🖨️ Imprimir
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(gerarTexto())}`} target="_blank" rel="noreferrer"
            className="py-2.5 border border-[#E8DFD0] rounded-xl text-xs text-center text-[#2C2520] bg-white hover:bg-[#FDF5EE] transition-colors">
            📲 WhatsApp
          </a>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep(3)} className="px-4 py-2.5 border border-[#E8DFD0] rounded-xl text-sm text-[#6B5A4E] hover:border-[#C4A882] transition-colors">← Editar</button>
          <button onClick={nova} className="flex-1 py-2.5 bg-[#2C2520] text-white rounded-xl text-sm font-medium hover:bg-[#8B6B4A] transition-colors">
            + Nova especificação
          </button>
        </div>

        <p className="text-center text-xs text-[#6B5A4E]/50 mt-4">
          {salvo ? '✓ Salvo no histórico' : ''} · Cálculo teórico · Sujeito a variações de aplicação.
        </p>
      </div>
    )
  }

  return null
}

export default function EspecificacaoPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <EspecificacaoWrapper />
      </Suspense>
    </div>
  )
}

function EspecificacaoWrapper() {
  const [session, setSession] = useState<{ nome: string; perfil: string; boutiqueName: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.usuario) setSession(d.usuario)
    }).catch(() => {})
  }, [])

  return (
    <>
      {session && <Nav nome={session.nome} perfil={session.perfil} boutique={session.boutiqueName} />}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Suspense fallback={<p className="text-sm text-[#6B5A4E]">Carregando...</p>}>
          <EspecificacaoInner />
        </Suspense>
      </main>
    </>
  )
}

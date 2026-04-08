'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'
import AuthGuard, { authFetch } from '@/components/AuthGuard'

const CORES_MATTE_PALETTE: Record<string, { hex: string }> = {
  'Polar':     { hex: '#F2F2F0' },
  'Luar':      { hex: '#C8CFCB' },
  'Concreto':  { hex: '#8E9491' },
  'Asfalto':   { hex: '#696E6B' },
  'Athena':    { hex: '#5C6E70' },
  'Jeans':     { hex: '#2E5470' },
  'Alma':      { hex: '#8B90B0' },
  'Nude':      { hex: '#C5C0A8' },
  'Rosé':      { hex: '#C9A898' },
  'Blush':     { hex: '#C87850' },
  'Deserto':   { hex: '#B5AE98' },
  'Dijon':     { hex: '#D4A820' },
  'Gold':      { hex: '#C48A20' },
  'Terracota': { hex: '#B86030' },
  'Pimenta':   { hex: '#A02830' },
  'Selva':     { hex: '#4A5040' },
  'Beringela': { hex: '#7A6878' },
  'Grafito':   { hex: '#4A4E4C' },
  'Orvalho':   { hex: '#A8C8B4' },
  'Orégano':   { hex: '#8A8A28' },
  'Alecrim':   { hex: '#6A7848' },
  'Amazônia':  { hex: '#2A6050' },
}
const CORES_LUNAR_PALETTE = CORES_MATTE_PALETTE
const CORES_MATTE = Object.keys(CORES_MATTE_PALETTE)
const CORES_LUNAR = Object.keys(CORES_LUNAR_PALETTE)

// Cristal — cores aproximadas
const CORES_CRISTAL_PALETTE: Record<string, { hex: string }> = {
  'Maldivas':    { hex: '#A8D8D0' },
  'Dubai':       { hex: '#C8B89A' },
  'Trancoso':    { hex: '#D4C4A0' },
  'Rio':         { hex: '#8FB8D0' },
  'Grécia':      { hex: '#B8D0E0' },
  'Mykonos':     { hex: '#E8E4DC' },
  'Madri':       { hex: '#C0A888' },
  'Pompéia':     { hex: '#A85840' },
  'Marrocos':    { hex: '#C07040' },
  'Pedra Ferro': { hex: '#707878' },
  'Hitam':       { hex: '#282828' },
  'Dubai Preto': { hex: '#1E1E1E' },
  'Berilo':      { hex: '#70A890' },
  'Vulcano':     { hex: '#484848' },
  'Parise Black':{ hex: '#181818' },
  'Marroquito':  { hex: '#B87050' },
  'Dunas':       { hex: '#D8C8A8' },
  'Full Gray':   { hex: '#909090' },
  'Grigio':      { hex: '#B0B0A8' },
  'Hágata':      { hex: '#C0A8C0' },
  'Dubai Red':   { hex: '#A03828' },
}

// Granulado — cores aproximadas
const CORES_GRANULADO_PALETTE: Record<string, { hex: string }> = {
  'Papel Picado':   { hex: '#F0E8D8' },
  'Nevada':         { hex: '#E8E8E4' },
  'Gelo Seco':      { hex: '#D8E0E8' },
  'Areia':          { hex: '#D4C098' },
  'Marfim':         { hex: '#E8DCC0' },
  'Capuccino':      { hex: '#B89070' },
  'Cinza Claro':    { hex: '#C0C0BC' },
  'Cinza Elefante': { hex: '#808080' },
  'Carbono':        { hex: '#303030' },
}

const CATS = [
  { id: 'cimento',   nome: 'Cimento Queimado',           imgUrl: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&q=80', desc: 'Matte e Lunar' },
  { id: 'cristal',   nome: 'Cristal de Pedras Naturais', imgUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', desc: '#10 e #20' },
  { id: 'drenante',  nome: 'Piso Drenante Resinado',     imgUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80', desc: 'Uso externo' },
  { id: 'granulado', nome: 'Granulados',                  imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', desc: '9 cores' },
]

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

const PERDA_PRESETS_CIMENTO  = [[5,'Baixo'],[10,'Médio'],[15,'Alto']] as const
const PERDA_PRESETS_DRENANTE = [[10,'Baixo'],[15,'Médio'],[20,'Alto']] as const

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

function ColorSwatch({ nome, hex, selected, onClick, size = 'sm' }: {
  nome: string; hex: string; selected: boolean; onClick: () => void; size?: 'sm' | 'lg'
}) {
  const isLight = parseInt(hex.slice(1), 16) > 0xAAAAAA
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${selected ? 'border-[#D4875A] bg-[#FDF5EE] shadow-sm' : 'border-[#E8DFD0] bg-white hover:border-[#C4A882]'}`}>
      <div
        className={`rounded-full border border-black/10 shadow-inner ${size === 'lg' ? 'w-12 h-12' : 'w-9 h-9'}`}
        style={{ backgroundColor: hex }}
      />
      <span className="text-[10px] text-[#2C2520] font-medium text-center leading-tight">{nome}</span>
    </button>
  )
}

function EspecificacaoInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [cat, setCat] = useState(searchParams.get('cat') || '')
  const [linha, setLinha] = useState('')
  const [cor, setCor] = useState('')
  const [gran, setGran] = useState('')
  const [tipoBase, setTipoBase] = useState('')
  const [tipoTrafego, setTipoTrafego] = useState('')
  const [area, setArea] = useState('')
  const [largura, setLargura] = useState('')
  const [comprimento, setComprimento] = useState('')
  const [perda, setPerda] = useState(5)
  const [usarPrimer, setUsarPrimer] = useState(true)
  const [usarFundo, setUsarFundo] = useState(true)
  const [usarTela, setUsarTela] = useState(true)
  const [usarCera, setUsarCera] = useState(false)
  const [consumoPrimer, setConsumoPrimer] = useState(200)
  const [mostrarAvisoTela, setMostrarAvisoTela] = useState(false)
  const [mostrarAvisoPrimer, setMostrarAvisoPrimer] = useState(false)
  const [precos, setPrecos] = useState<Record<string, number>>({})
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [salvo, setSalvo] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => { if (searchParams.get('cat')) setStep(2) }, [])
  useEffect(() => { if (cat === 'drenante') setPerda(10); else setPerda(5) }, [cat])

  // Quando muda substrato do drenante — ajusta primer e tela automaticamente
  useEffect(() => {
    if (cat !== 'drenante') return
    setUsarTela(true)
    setMostrarAvisoTela(false)
    if (tipoBase === 'Solo Natural') {
      setUsarPrimer(false)
      setMostrarAvisoPrimer(false)
    } else if (tipoBase === 'Contrapiso') {
      setUsarPrimer(true)
      setMostrarAvisoPrimer(false)
    } else if (tipoBase === 'Concreto Drenante') {
      setUsarPrimer(true)
      setMostrarAvisoPrimer(false)
    }
  }, [tipoBase, cat])

  // Calcula área automaticamente quando largura e comprimento mudam
  useEffect(() => {
    const l = parseFloat(largura)
    const c = parseFloat(comprimento)
    if (l > 0 && c > 0) {
      setArea(String(+(l * c).toFixed(2)))
    }
  }, [largura, comprimento])

  function handleDesmarcarTela() { setUsarTela(false); setMostrarAvisoTela(true) }

  function handleTogglePrimer(checked: boolean) {
    setUsarPrimer(checked)
    if (!checked && tipoBase === 'Solo Natural') {
      setMostrarAvisoPrimer(false) // Solo natural: normal desmarcar
    } else if (!checked) {
      setMostrarAvisoPrimer(true)
    } else {
      setMostrarAvisoPrimer(false)
    }
  }

  function passo2Pronto() {
    if (cat === 'cimento') return !!(linha && cor)
    if (cat === 'cristal') return !!(cor && gran)
    if (cat === 'drenante') return !!(cor && tipoBase && tipoTrafego)
    if (cat === 'granulado') return !!cor
    return false
  }

  async function calcular() {
    const areaNum = parseFloat(area)
    if (!areaNum || areaNum <= 0) { alert('Informe a área do projeto.'); return }
    const entrada = {
      categoriaId: cat, cor, linha, granulometria: gran,
      tipoAplicacao: 'Parede/Teto', ambiente: 'Interno',
      tipoBase, tipoTrafego, area: areaNum, perda,
      usarPrimer, usarFundo, usarTela, usarCera, consumoPrimer, precos,
    }
    try {
      const res = await authFetch('/api/simulacoes', { method: 'POST', body: JSON.stringify(entrada) })
      const data = await res.json()
      if (res.ok) { setResultado(data.simulacao.resultado); setSalvo(true); setStep(4) }
      else alert(data.erro || 'Erro ao calcular.')
    } catch (e) {
      alert('Erro de conexão. Tente novamente.')
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
    navigator.clipboard.writeText(gerarTexto()).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000) })
  }

  function nova() {
    setCat(''); setLinha(''); setCor(''); setGran('')
    setTipoBase(''); setTipoTrafego(''); setArea(''); setLargura(''); setComprimento('')
    setPerda(5); setPrecos({}); setResultado(null); setSalvo(false)
    setUsarPrimer(true); setUsarFundo(true); setUsarTela(true); setUsarCera(false)
    setMostrarAvisoTela(false); setMostrarAvisoPrimer(false)
    setStep(1); router.push('/especificacao')
  }

  const radioBtn = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${active ? 'bg-[#2C2520] border-[#2C2520] text-white' : 'border-[#E8DFD0] text-[#6B5A4E] hover:border-[#C4A882]'}`}>
      {label}
    </button>
  )

  const fieldLabel = (text: string, sub?: string) => (
    <label className="block text-xs font-medium text-[#6B5A4E] tracking-wider uppercase mb-1.5">
      {text}{sub && <span className="ml-2 normal-case font-normal text-[#6B5A4E]/60">{sub}</span>}
    </label>
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

  const avisoCard = (texto: string, tipo: 'erro' | 'aviso' = 'aviso') => (
    <div className={`p-3 rounded-xl text-xs leading-relaxed flex gap-2 mt-2 ${tipo === 'erro' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-amber-50 border border-amber-300 text-amber-900'}`}>
      <span className="text-base shrink-0">{tipo === 'erro' ? '🚫' : '⚠️'}</span>
      <span>{texto}</span>
    </div>
  )

  const perdaPresets = cat === 'drenante' ? PERDA_PRESETS_DRENANTE : PERDA_PRESETS_CIMENTO

  const navBar = (
    <div className="flex gap-1 mb-6 overflow-x-auto">
      {['Categoria','Produto','Medidas','Resultado'].map((l, i) => (
        <div key={l} className="flex items-center gap-1 shrink-0">
          <button onClick={() => { if (i + 1 < step) setStep(i + 1) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${step === i+1 ? 'bg-[#2C2520] text-white' : step > i+1 ? 'text-[#C4A882] cursor-pointer' : 'text-[#6B5A4E]/40'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${step === i+1 ? 'bg-white/20' : step > i+1 ? 'bg-[#C4A882]/20' : 'bg-[#E8DFD0]'}`}>{i+1}</span>
            {l}
          </button>
          {i < 3 && <span className="text-[#E8DFD0]">›</span>}
        </div>
      ))}
    </div>
  )

  // ── STEP 1 ──
  if (step === 1) return (
    <div>
      {navBar}
      <h2 className="text-xl font-serif text-[#2C2520] mb-1">Selecione a categoria</h2>
      <p className="text-sm text-[#6B5A4E] mb-6">Qual produto será especificado?</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {CATS.map(c => (
          <button key={c.id} onClick={() => { setCat(c.id); setCor(''); setLinha(''); setGran('') }}
            className={`text-left rounded-2xl border overflow-hidden transition-all ${cat === c.id ? 'border-[#D4875A] ring-2 ring-[#D4875A]/30' : 'border-[#E8DFD0] hover:border-[#C4A882]'}`}>
            <div className="h-36 relative overflow-hidden">
              <img src={c.imgUrl} alt={c.nome} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {cat === c.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#D4875A] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-white">
              <p className="text-sm font-medium text-[#2C2520]">{c.nome}</p>
              <p className="text-xs text-[#6B5A4E] mt-0.5">{c.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => cat && setStep(2)} disabled={!cat}
        className="w-full py-3 bg-[#2C2520] text-white rounded-xl text-sm font-medium hover:bg-[#8B6B4A] transition-colors disabled:opacity-40">
        Continuar →
      </button>
    </div>
  )

  // ── STEP 2 ──
  if (step === 2) return (
    <div>
      {navBar}
      <h2 className="text-xl font-serif text-[#2C2520] mb-1">{CATS.find(c => c.id === cat)?.nome}</h2>
      <p className="text-sm text-[#6B5A4E] mb-6">Configure o produto</p>

      {/* CIMENTO */}
      {cat === 'cimento' && (
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="flex-1 p-3 bg-[#F5EFE0] border border-[#E8DFD0] rounded-xl text-xs text-[#6B5A4E] flex items-center gap-2">
              🏠 Aplicação: <strong>Parede e Teto</strong>
            </div>
            <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-center gap-2">
              🔒 <strong>Uso interno</strong> exclusivamente
            </div>
          </div>
          <div>
            {fieldLabel('Linha')}
            <div className="flex gap-2">
              {['Matte','Lunar'].map(l => radioBtn(l, linha===l, () => { setLinha(l); setCor('') }))}
            </div>
            {linha === 'Lunar' && <p className="text-xs text-blue-600 mt-2 bg-blue-50 rounded-lg px-3 py-2">Linha Lunar tem acabamento perolizado — uso exclusivo em ambientes internos.</p>}
          </div>
          {linha && (
            <div>
              {fieldLabel('Cor', cor ? `— ${cor}` : '')}
              <div className="grid grid-cols-5 gap-2">
                {(linha === 'Matte' ? CORES_MATTE : CORES_LUNAR).map(nome => (
                  <ColorSwatch key={nome} nome={nome}
                    hex={(linha === 'Matte' ? CORES_MATTE_PALETTE : CORES_LUNAR_PALETTE)[nome]?.hex || '#999'}
                    selected={cor === nome} onClick={() => setCor(nome)} />
                ))}
              </div>
            </div>
          )}
          {linha && cor && (
            <div>
              {fieldLabel('Complemento opcional')}
              <label className="flex items-center gap-3 p-3 bg-white border border-[#E8DFD0] rounded-xl cursor-pointer hover:border-[#C4A882] transition-colors">
                <input type="checkbox" checked={usarCera} onChange={e => setUsarCera(e.target.checked)} className="w-4 h-4 accent-[#D4875A]" />
                <div>
                  <p className="text-sm text-[#2C2520] font-medium">Cera Acrílica</p>
                  <p className="text-xs text-[#6B5A4E]">Proteção e acabamento final — recomendado</p>
                </div>
              </label>
            </div>
          )}
        </div>
      )}

      {/* CRISTAL */}
      {cat === 'cristal' && (
        <div className="space-y-4">
          <div>
            {fieldLabel('Cor / Referência', cor ? `— ${cor}` : '')}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(CORES_CRISTAL_PALETTE).map(([nome, { hex }]) => (
                <ColorSwatch key={nome} nome={nome} hex={hex} size="lg"
                  selected={cor === nome}
                  onClick={() => { setCor(nome); const g = GRAN_POR_COR[nome]||[]; setGran(g.length===1?g[0]:'') }} />
              ))}
            </div>
          </div>
          {cor && (
            <div>
              {fieldLabel('Granulometria')}
              <div className="flex gap-2">{(GRAN_POR_COR[cor]||['#10','#20']).map(g => radioBtn(g, gran===g, () => setGran(g)))}</div>
              <p className="text-xs text-[#6B5A4E] mt-1.5 bg-[#F5EFE0] rounded-lg px-3 py-2">
                #20 = 3,83 kg/m² · ~6 m²/balde&nbsp;&nbsp;|&nbsp;&nbsp;#10 = 5 kg/m² · ~4,5 m²/balde
              </p>
            </div>
          )}
          <div>
            {fieldLabel('Complementares')}
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-white border border-[#E8DFD0] rounded-xl cursor-pointer hover:border-[#C4A882] transition-colors">
                <input type="checkbox" checked={usarPrimer} onChange={e => setUsarPrimer(e.target.checked)} className="w-4 h-4 accent-[#D4875A]" />
                <div><p className="text-sm text-[#2C2520] font-medium">Primer Cristal</p><p className="text-xs text-[#6B5A4E]">Obrigatório</p></div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-white border border-[#E8DFD0] rounded-xl cursor-pointer hover:border-[#C4A882] transition-colors">
                <input type="checkbox" checked={usarFundo} onChange={e => setUsarFundo(e.target.checked)} className="w-4 h-4 accent-[#D4875A]" />
                <div><p className="text-sm text-[#2C2520] font-medium">Fundo Preparador</p><p className="text-xs text-[#6B5A4E]">Recomendado</p></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* DRENANTE */}
      {cat === 'drenante' && (
        <div className="space-y-4">
          <div>{fieldLabel('Cor / Mistura')}{selectEl(cor, setCor, CORES_DRENANTE)}</div>
          <div>
            {fieldLabel('Tipo de substrato')}
            <div className="flex flex-wrap gap-2">
              {['Solo Natural','Contrapiso','Concreto Drenante'].map(b => radioBtn(b, tipoBase===b, () => setTipoBase(b)))}
            </div>
          </div>
          <div>
            {fieldLabel('Tipo de tráfego')}
            <div className="flex flex-wrap gap-2">
              {['Pedestres','Veículos Leves','Tráfego Pesado'].map(t => radioBtn(t, tipoTrafego===t, () => setTipoTrafego(t)))}
            </div>
          </div>
          <div>
            {fieldLabel('Complementares')}
            <div className="space-y-2">
              {/* Tela */}
              <div className="p-3 bg-white border border-[#E8DFD0] rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={usarTela}
                    onChange={e => { if (!e.target.checked) handleDesmarcarTela(); else { setUsarTela(true); setMostrarAvisoTela(false) } }}
                    className="w-4 h-4 accent-[#D4875A]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#2C2520] font-medium">Tela de Fibra de Vidro</p>
                    <p className="text-xs text-[#6B5A4E]">Indispensável para todos os substratos</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">obrigatório</span>
                </label>
                {mostrarAvisoTela && avisoCard('A Tela de Fibra de Vidro é INDISPENSÁVEL. Venda sem tela apenas como complemento de pedidos anteriores.', 'erro')}
              </div>
              {/* Primer PU */}
              <div className="p-3 bg-white border border-[#E8DFD0] rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={usarPrimer}
                    onChange={e => handleTogglePrimer(e.target.checked)}
                    className="w-4 h-4 accent-[#D4875A]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#2C2520] font-medium">Primer PU</p>
                    <p className="text-xs text-[#6B5A4E]">
                      {tipoBase === 'Solo Natural'
                        ? 'Não recomendado para Solo Natural'
                        : tipoBase === 'Contrapiso' || tipoBase === 'Concreto Drenante'
                          ? 'Obrigatório para este substrato'
                          : 'Recomendado'}
                    </p>
                  </div>
                  {(tipoBase === 'Contrapiso' || tipoBase === 'Concreto Drenante') && (
                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">obrigatório</span>
                  )}
                  {tipoBase === 'Solo Natural' && !usarPrimer && (
                    <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-full">não recomendado</span>
                  )}
                </label>
                {mostrarAvisoPrimer && tipoBase !== 'Solo Natural' && avisoCard('O Primer PU é INDISPENSÁVEL para este substrato. Recomende ao cliente incluí-lo.', 'erro')}
                {tipoBase === 'Solo Natural' && usarPrimer && avisoCard('Primer PU não é recomendado para Solo Natural. Você pode manter no orçamento se o cliente solicitar.')}
                {usarPrimer && (
                  <div className="mt-3 pt-3 border-t border-[#F0E8DC]">
                    <p className="text-xs text-[#6B5A4E] mb-2">Consumo de primer (g/m²)</p>
                    <div className="flex gap-2">
                      {[200, 250, 300, 350].map(v => (
                        <button key={v} onClick={() => setConsumoPrimer(v)}
                          className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${consumoPrimer === v ? 'bg-[#2C2520] text-white border-[#2C2520]' : 'border-[#E8DFD0] text-[#6B5A4E]'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRANULADO */}
      {cat === 'granulado' && (
        <div className="space-y-4">
          <div className="p-3 bg-[#F5EFE0] border border-[#E8DFD0] rounded-xl text-xs text-[#6B5A4E]">
            Consumo: 8 kg/m² · Embalagem: balde 23 kg · Uso interno e externo
          </div>
          <div>
            {fieldLabel('Cor', cor ? `— ${cor}` : '')}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CORES_GRANULADO_PALETTE).map(([nome, { hex }]) => (
                <ColorSwatch key={nome} nome={nome} hex={hex} size="lg"
                  selected={cor === nome} onClick={() => setCor(nome)} />
              ))}
            </div>
          </div>
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

  // ── STEP 3 ──
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
              onChange={e => setLargura(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E8DFD0] rounded-lg text-sm focus:outline-none focus:border-[#C4A882]" />
          </div>
          <div>
            {fieldLabel('Comprimento (m)')}
            <input type="number" min={0.1} step={0.1} placeholder="0,00" value={comprimento}
              onChange={e => setComprimento(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E8DFD0] rounded-lg text-sm focus:outline-none focus:border-[#C4A882]" />
          </div>
        </div>
        {largura && comprimento && parseFloat(largura) > 0 && parseFloat(comprimento) > 0 && (
          <div className="px-3 py-2 bg-[#F5EFE0] border border-[#E8DFD0] rounded-lg text-xs text-[#6B5A4E]">
            Área calculada: <strong className="text-[#2C2520]">{(parseFloat(largura) * parseFloat(comprimento)).toFixed(2)} m²</strong>
          </div>
        )}
        <div>
          {fieldLabel('Ou área total (m²)')}
          <input type="number" min={0.1} step={0.1} placeholder="0,00" value={area}
            onChange={e => { setArea(e.target.value); setLargura(''); setComprimento('') }}
            className="w-full px-3 py-2.5 border border-[#E8DFD0] rounded-lg text-sm focus:outline-none focus:border-[#C4A882]" />
        </div>
        <div>
          {fieldLabel(`Fator de perda — ${perda}%`)}
          <div className="flex gap-2 mt-1">
            {perdaPresets.map(([v, label]) => (
              <button key={v} onClick={() => setPerda(Number(v))}
                className={`flex-1 py-2 rounded-xl text-sm border transition-colors ${perda === Number(v) ? 'bg-[#2C2520] text-white border-[#2C2520]' : 'border-[#E8DFD0] text-[#6B5A4E] hover:border-[#C4A882]'}`}>
                <span className="font-medium">{v}%</span>
                <span className="block text-xs opacity-70 mt-0.5">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-[#E8DFD0] pt-4">
          <p className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase mb-3">Preços unitários (opcional)</p>
          <div className="grid grid-cols-2 gap-2">
            {cat === 'cimento' && <>{precoInput('Cimento Queimado (balde)', 'principal')}{usarCera && precoInput('Cera Acrílica', 'cera')}</>}
            {cat === 'cristal' && <>{precoInput('Cristal (balde 23 kg)','principal')}{usarPrimer && precoInput('Primer Cristal','primer')}{usarFundo && precoInput('Fundo Preparador','fundo')}</>}
            {cat === 'drenante' && <>{precoInput('Piso Drenante (kit 16 kg)','principal')}{usarPrimer && precoInput('Primer PU (4 kg)','primer')}{usarTela && precoInput('Tela de Fibra (rolo)','tela')}</>}
            {cat === 'granulado' && <>{precoInput('Granulado (balde 23 kg)','principal')}{usarPrimer && precoInput('Primer','primer')}</>}
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={() => setStep(2)} className="px-4 py-2.5 border border-[#E8DFD0] rounded-xl text-sm text-[#6B5A4E] hover:border-[#C4A882] transition-colors">← Voltar</button>
        <button onClick={calcular} className="flex-1 py-2.5 bg-[#2C2520] text-white rounded-xl text-sm font-medium hover:bg-[#8B6B4A] transition-colors">
          Calcular →
        </button>
      </div>
    </div>
  )

  // ── STEP 4 ──
  if (step === 4 && resultado) {
    const principal = resultado.itens.find(i => i.tipoRelacao === 'principal')
    const compComQtd = resultado.itens.filter(i => i.tipoRelacao !== 'principal' && i.quantidade > 0)
    const compSemQtd = resultado.itens.filter(i => i.tipoRelacao !== 'principal' && i.quantidade === 0)
    return (
      <div>
        {navBar}
        <h2 className="text-xl font-serif text-[#2C2520] mb-1">Resultado</h2>
        <p className="text-sm text-[#6B5A4E] mb-5">{CATS.find(c => c.id === cat)?.nome}</p>
        <div className="bg-white border border-[#E8DFD0] rounded-xl overflow-hidden mb-3">
          <div className="bg-[#2C2520] px-4 py-3">
            <p className="text-sm font-medium text-[#C4A882]">{principal?.nome}</p>
          </div>
          <div className="divide-y divide-[#F0E8DC]">
            {[['Área informada',`${resultado.areaLiquida.toFixed(1)} m²`],['Fator de perda',`${resultado.perdaAplicada}%`],['Área com perda',`${resultado.areaComPerda.toFixed(1)} m²`],['Consumo',principal?.observacao||'']].map(([l,v]) => (
              <div key={l} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-[#6B5A4E]">{l}</span>
                <span className="font-medium text-right max-w-[60%]">{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-[#6B5A4E]">Quantidade recomendada</span>
              <div className="text-right">
                <span className="bg-[#FDF5EE] text-[#D4875A] font-medium text-sm px-3 py-1 rounded-lg">{principal?.quantidade} {principal?.unidade}</span>
                {principal?.precoUnit && principal.precoUnit > 0 && (
                  <p className="text-xs text-[#6B5A4E] mt-1">{fmt(principal.precoUnit)} un · <strong>{fmt(principal.subtotal||0)}</strong></p>
                )}
              </div>
            </div>
          </div>
        </div>
        {compComQtd.length > 0 && (
          <div className="bg-white border border-[#E8DFD0] rounded-xl overflow-hidden mb-3">
            <div className="bg-[#F5EFE0] px-4 py-2.5">
              <p className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase">Complementares</p>
            </div>
            <div className="divide-y divide-[#F0E8DC]">
              {compComQtd.map(item => (
                <div key={item.nome} className="flex justify-between items-center px-4 py-2.5">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${item.tipoRelacao==='obrigatorio'?'bg-red-50 text-red-700 border border-red-200':'bg-amber-50 text-amber-700 border border-amber-200'}`}>{item.tipoRelacao}</span>
                    <span className="text-sm text-[#2C2520]">{item.nome}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.quantidade} {item.unidade}</p>
                    {item.precoUnit && item.precoUnit > 0 && <p className="text-xs text-[#6B5A4E]">{fmt(item.precoUnit)} · <strong>{fmt(item.subtotal||0)}</strong></p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
        {resultado.totalGeral > 0 && (
          <div className="bg-[#2C2520] rounded-xl px-5 py-4 flex justify-between items-center mb-3">
            <span className="text-sm text-[#C4A882]">Total estimado</span>
            <span className="text-xl font-serif text-white">{fmt(resultado.totalGeral)}</span>
          </div>
        )}
        {resultado.alertas.length > 0 && (
          <div className="space-y-2 mb-4">
            {resultado.alertas.map((a,i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">{a}</div>
            ))}
          </div>
        )}
        <div className="mb-4">
          <p className="text-xs font-medium text-[#6B5A4E] tracking-wider uppercase mb-2">Resumo para orçamento</p>
          <pre className="bg-[#2C2520] text-[#C4A882] rounded-xl p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">{gerarTexto()}</pre>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button onClick={copiar} className="py-2.5 border border-[#E8DFD0] rounded-xl text-xs text-[#2C2520] bg-white hover:bg-[#FDF5EE] transition-colors">{copiado ? '✓ Copiado' : '📋 Copiar'}</button>
          <button onClick={() => window.print()} className="py-2.5 border border-[#E8DFD0] rounded-xl text-xs text-[#2C2520] bg-white hover:bg-[#FDF5EE] transition-colors">🖨️ Imprimir</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(gerarTexto())}`} target="_blank" rel="noreferrer"
            className="py-2.5 border border-[#E8DFD0] rounded-xl text-xs text-center text-[#2C2520] bg-white hover:bg-[#FDF5EE] transition-colors">📲 WhatsApp</a>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStep(3)} className="px-4 py-2.5 border border-[#E8DFD0] rounded-xl text-sm text-[#6B5A4E] hover:border-[#C4A882] transition-colors">← Editar</button>
          <button onClick={nova} className="flex-1 py-2.5 bg-[#2C2520] text-white rounded-xl text-sm font-medium hover:bg-[#8B6B4A] transition-colors">+ Nova especificação</button>
        </div>
        <p className="text-center text-xs text-[#6B5A4E]/50 mt-4">{salvo ? '✓ Salvo no histórico' : ''} · Cálculo teórico · Sujeito a variações de aplicação.</p>
      </div>
    )
  }

  return null
}

export default function EspecificacaoPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Suspense fallback={null}>
          <EspecificacaoWrapper />
        </Suspense>
      </div>
    </AuthGuard>
  )
}

function EspecificacaoWrapper() {
  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Suspense fallback={<p className="text-sm text-[#6B5A4E]">Carregando...</p>}>
          <EspecificacaoInner />
        </Suspense>
      </main>
    </>
  )
}

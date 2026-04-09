'use client'

import Link from 'next/link'
import { useState } from 'react'

const produtos = [
  {
    id: 'cimento-queimado',
    nome: 'Cimento queimado',
    tag: 'Interno',
    tagColor: 'bg-stone-100 text-stone-500',
    descricao: 'Acabamento mineral contínuo, sem rejuntes. Aspecto industrial e contemporâneo.',
    imagem: '/images/cimento_queimado.jpg',
    specs: [
      { label: 'Rendimento', value: '4–6 m²/kg' },
      { label: 'Espessura', value: '1–3 mm' },
      { label: 'Cura', value: '7 dias' },
      { label: 'Tráfego', value: 'Médio a alto' },
    ],
    faqs: [
      { q: 'Pode ser aplicado sobre cerâmica existente?', a: 'Sim, desde que a superfície esteja limpa e íntegra. Indicar lixamento leve e primer de aderência.' },
      { q: 'O tom fica uniforme em toda a área?', a: 'Variações naturais de textura e tonalidade fazem parte da estética. Para uniformidade alta, recomendamos amostra prévia.' },
      { q: 'Qual selador indicar?', a: 'Acrílico ou PU fosco para áreas secas. Em áreas molhadas, selador impermeabilizante com mínimo 3 demãos.' },
      { q: 'Como calcular a quantidade?', a: 'Rendimento de 4–6 m²/kg por demão, 2–3 demãos. A calculadora inclui 10% de perda automaticamente.' },
    ],
    href: '/nova-especificacao',
  },
  {
    id: 'cristal',
    nome: 'Cristal de pedras naturais',
    tag: 'Interno',
    tagColor: 'bg-stone-100 text-stone-500',
    descricao: 'Agregados minerais em resina transparente. Pedras reais — quartzo, mármore, granito.',
    imagem: '/images/cristal.jpg',
    specs: [
      { label: 'Rendimento', value: '2–3 kg/m²' },
      { label: 'Espessura', value: '3–5 mm' },
      { label: 'Cura', value: '24–48 h' },
      { label: 'Tráfego', value: 'Leve a médio' },
    ],
    faqs: [
      { q: 'As pedras são naturais ou sintéticas?', a: 'Minerais naturais — quartzo, mármore e granito britados. A resina é sintética, mas os agregados são 100% naturais.' },
      { q: 'Pode ser usado em área molhada?', a: 'Requer impermeabilização prévia da base e verniz para ambientes úmidos. Não recomendado para piscinas.' },
      { q: 'Como combinar com outros revestimentos?', a: 'Dialoga bem com pisos neutros e paredes em tons frios. A calculadora permite montar ambientes combinando produtos.' },
    ],
    href: '/nova-especificacao',
  },
  {
    id: 'drenante',
    nome: 'Piso drenante resinado',
    tag: 'Externo',
    tagColor: 'bg-sky-50 text-sky-600',
    descricao: 'Piso permeável de alta resistência. Elimina empoçamento com drenagem natural entre grânulos.',
    imagem: '/images/drenando.jpg',
    specs: [
      { label: 'Rendimento', value: '15–20 kg/m²' },
      { label: 'Espessura', value: '20–30 mm' },
      { label: 'Cura', value: '12–24 h' },
      { label: 'Tráfego', value: 'Pedestre e veicular leve' },
    ],
    faqs: [
      { q: 'Precisa de caimento para escoamento?', a: 'Não. A drenagem é vertical entre os grânulos. A base precisa ter absorção ou sistema de escoamento abaixo.' },
      { q: 'Suporta veículos?', a: 'Carros de passeio com 25 mm+ sobre base compactada. Para tráfego pesado, consultar especificação técnica completa.' },
      { q: 'Como calcular para área irregular?', a: 'Some os recortes para obter a área total em m². O sistema inclui 10% de perda no cálculo.' },
    ],
    href: '/nova-especificacao',
  },
  {
    id: 'granulado',
    nome: 'Granulados',
    tag: 'Interno e externo',
    tagColor: 'bg-amber-50 text-amber-600',
    descricao: 'Agregados decorativos para pisos, jardins e lazer. Alta versatilidade estética.',
    imagem: '/images/granulado.jpg',
    specs: [
      { label: 'Granulometria', value: 'Fino, médio, grosso' },
      { label: 'Fixação', value: 'Livre ou com resina' },
      { label: 'Coloração', value: 'Natural ou colorido' },
      { label: 'Tráfego', value: 'Conforme aplicação' },
    ],
    faqs: [
      { q: 'Qual a diferença entre fixo e solto?', a: 'Solto: jardins sem tráfego, direto sobre manta ou solo. Fixo: misturado a resina ou argamassa, formando superfície rígida.' },
      { q: 'Mantém a cor no externo?', a: 'Minerais naturais não desbotam. Podem escurecer com umidade e retornam quando secos. Coloridos podem variar com UV prolongado.' },
      { q: 'Como calcular para jardim?', a: 'Para 3 cm de espessura: ~45 kg/m². A calculadora pede área e espessura e retorna o volume em sacos.' },
    ],
    href: '/nova-especificacao',
  },
]

export default function GuiaProdutos() {
  const [aberto, setAberto] = useState<string | null>(null)
  const [faqAberta, setFaqAberta] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-6 mb-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 uppercase mb-1">
          Tez Textura e Arte
        </p>
        <h1 className="text-2xl font-light text-stone-800 tracking-tight">Guia de produtos</h1>
        <p className="text-sm text-stone-400 mt-1">Especificações e respostas prontas para seu cliente</p>
      </div>

      {/* Cards */}
      <div className="px-4 flex flex-col gap-3 max-w-2xl mx-auto">
        {produtos.map((p) => {
          const estaAberto = aberto === p.id
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Linha colapsada */}
              <button
                className="w-full flex items-center gap-4 px-4 py-3.5 text-left"
                onClick={() => {
                  setAberto(estaAberto ? null : p.id)
                  setFaqAberta(null)
                }}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                  <img
                    src={p.imagem}
                    alt={p.nome}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full mb-1.5 ${p.tagColor}`}>
                    {p.tag}
                  </span>
                  <p className="text-sm font-semibold text-stone-800 leading-snug">{p.nome}</p>
                  <p className="text-xs text-stone-400 mt-0.5 truncate">{p.descricao}</p>
                </div>

                <svg
                  className={`flex-shrink-0 text-stone-300 transition-transform duration-300 ${estaAberto ? 'rotate-180' : ''}`}
                  width="18" height="18" viewBox="0 0 16 16" fill="none"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Painel expandido */}
              {estaAberto && (
                <div className="border-t border-stone-100 px-4 pb-5 pt-4">
                  {/* Foto grande */}
                  <div className="rounded-xl overflow-hidden mb-5 h-52 bg-stone-100">
                    <img
                      src={p.imagem}
                      alt={p.nome}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {p.specs.map((s) => (
                      <div key={s.label} className="bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-stone-400 mb-0.5">{s.label}</p>
                        <p className="text-sm font-medium text-stone-700">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* FAQs */}
                  <p className="text-[10px] font-semibold tracking-[0.15em] text-stone-400 uppercase mb-2">
                    Perguntas frequentes
                  </p>
                  <div className="rounded-xl border border-stone-100 overflow-hidden mb-4">
                    {p.faqs.map((faq, i) => {
                      const key = `${p.id}-${i}`
                      const abertaAgora = faqAberta === key
                      return (
                        <div key={key} className={i > 0 ? 'border-t border-stone-100' : ''}>
                          <button
                            className="w-full text-left px-3.5 py-3 flex items-start justify-between gap-2"
                            onClick={() => setFaqAberta(abertaAgora ? null : key)}
                          >
                            <span className="text-sm font-medium text-stone-700 leading-snug">{faq.q}</span>
                            <svg
                              className={`flex-shrink-0 mt-0.5 text-stone-300 transition-transform duration-200 ${abertaAgora ? 'rotate-180' : ''}`}
                              width="14" height="14" viewBox="0 0 16 16" fill="none"
                            >
                              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          {abertaAgora && (
                            <p className="text-sm text-stone-500 leading-relaxed px-3.5 pb-3.5">{faq.a}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* CTA */}
                  <Link
                    href={p.href}
                    className="flex items-center justify-center gap-2 text-sm font-semibold bg-stone-800 text-white rounded-xl py-3 hover:bg-stone-700 active:bg-stone-900 transition-colors"
                  >
                    Calcular quantidade
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

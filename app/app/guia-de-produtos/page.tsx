'use client'

import Link from 'next/link'
import Image from 'next/image'

const produtos = [
  {
    id: 'cimento-queimado',
    nome: 'Cimento queimado',
    tag: 'Uso interno',
    tagVariant: 'interno',
    descricao:
      'Acabamento mineral de alta performance com efeito contínuo. Sem rejuntes, aspecto industrial e contemporâneo.',
    imagem: '/images/cimento queimado.jpg',
    specs: [
      { label: 'Rendimento', value: '~4–6 m²/kg' },
      { label: 'Espessura', value: '1–3 mm' },
      { label: 'Cura', value: '7 dias' },
      { label: 'Superfícies', value: 'Concreto, alvenaria, argamassa' },
      { label: 'Impermeabilização', value: 'Selador obrigatório' },
      { label: 'Tráfego', value: 'Médio a alto' },
    ],
    faqs: [
      {
        q: 'Pode ser aplicado sobre cerâmica existente?',
        a: 'Sim, desde que a superfície esteja limpa, íntegra e sem peças soltas. Indicar lixamento leve e primer de aderência antes da aplicação.',
      },
      {
        q: 'Como calcular a quantidade para o projeto?',
        a: 'O rendimento médio é de 4 a 6 m²/kg por demão. Recomendamos 2 a 3 demãos. A calculadora da Tez calcula automaticamente incluindo perda de 10%.',
      },
      {
        q: 'O tom vai ficar uniforme em toda a área?',
        a: 'O cimento queimado tem variações naturais de textura e tonalidade — isso é parte da estética do produto. Para projetos com exigência de uniformidade alta, recomendamos amostra executada antes da aprovação.',
      },
      {
        q: 'Qual selador indicar?',
        a: 'Selador acrílico ou PU fosco para ambientes internos secos. Em áreas molhadas como banheiros, exige selador impermeabilizante com pelo menos 3 demãos.',
      },
    ],
    href: '/nova-especificacao?produto=cimento-queimado',
  },
  {
    id: 'cristal',
    nome: 'Cristal de pedras naturais',
    tag: 'Uso interno',
    tagVariant: 'interno',
    descricao:
      'Agregados minerais naturais aplicados em resina transparente. Cada tonalidade é composta por pedras reais — quartzo, mármore, granito.',
    imagem: '/images/cristal.jpg',
    specs: [
      { label: 'Rendimento', value: '~2–3 kg/m²' },
      { label: 'Espessura', value: '3–5 mm' },
      { label: 'Cura', value: '24–48 h' },
      { label: 'Superfícies', value: 'Concreto, argamassa nivelada' },
      { label: 'Brilho', value: 'Verniz de acabamento' },
      { label: 'Tráfego', value: 'Leve a médio' },
    ],
    faqs: [
      {
        q: 'As pedras são naturais ou sintéticas?',
        a: 'São minerais naturais — quartzo, mármore e granito britados. A resina que as une é sintética, mas os agregados são 100% naturais, o que garante as variações de cor e brilho características do produto.',
      },
      {
        q: 'Pode ser usado em área molhada?',
        a: 'O produto em si é resistente à umidade, mas a aplicação em áreas molhadas requer impermeabilização prévia da base e verniz específico para ambientes úmidos. Não recomendado para piscinas ou submerso.',
      },
      {
        q: 'Como combinar com outros revestimentos no projeto?',
        a: 'O Cristal dialoga bem com pisos neutros e paredes em tons frios. Para coordenação de projeto, a calculadora permite montar ambientes combinando produtos — ideal para apresentar ao cliente.',
      },
    ],
    href: '/nova-especificacao?produto=cristal',
  },
  {
    id: 'drenante',
    nome: 'Piso drenante resinado',
    tag: 'Uso externo',
    tagVariant: 'externo',
    descricao:
      'Piso permeável de alta resistência para áreas externas. Permite escoamento da água entre os grânulos, eliminando empoçamento.',
    imagem: '/images/drenando.jpg',
    specs: [
      { label: 'Rendimento', value: '~15–20 kg/m²' },
      { label: 'Espessura', value: '20–30 mm' },
      { label: 'Cura', value: '12–24 h' },
      { label: 'Base', value: 'Brita compactada ou concreto poroso' },
      { label: 'Drenagem', value: 'Natural entre grânulos' },
      { label: 'Tráfego', value: 'Pedestre e veicular leve' },
    ],
    faqs: [
      {
        q: 'Precisa de caimento para escoamento?',
        a: 'Não necessariamente. A drenagem ocorre verticalmente entre os grânulos. A base, no entanto, precisa ter condição de absorção ou sistema de escoamento abaixo.',
      },
      {
        q: 'Suporta veículos?',
        a: 'Suporta tráfego veicular leve (carros de passeio) com espessura de 25 mm ou mais sobre base compactada adequada. Para tráfego pesado ou frequente, consultar especificação técnica completa.',
      },
      {
        q: 'Como calcular para uma área irregular?',
        a: 'A calculadora trabalha com área total em m². Para áreas irregulares, basta somar os recortes. O sistema já inclui perda de 10% no cálculo final.',
      },
    ],
    href: '/nova-especificacao?produto=drenante',
  },
  {
    id: 'granulado',
    nome: 'Granulados',
    tag: 'Interno e externo',
    tagVariant: 'ambos',
    descricao:
      'Agregados decorativos para composição de pisos, jardins e áreas de lazer. Alta versatilidade estética e de aplicação.',
    imagem: '/images/granulado.jpg',
    specs: [
      { label: 'Rendimento', value: 'Variável por tipo' },
      { label: 'Granulometria', value: 'Fino, médio, grosso' },
      { label: 'Fixação', value: 'Livre ou com resina' },
      { label: 'Superfícies', value: 'Solo, concreto, composto' },
      { label: 'Coloração', value: 'Natural ou colorido' },
      { label: 'Tráfego', value: 'Conforme aplicação' },
    ],
    faqs: [
      {
        q: 'Qual a diferença entre granulado fixo e solto?',
        a: 'O granulado solto é usado em jardins e áreas de paisagismo sem tráfego — disposto diretamente sobre manta ou solo. O granulado fixo é misturado a resina ou argamassa, formando uma superfície rígida com tráfego pedestre.',
      },
      {
        q: 'Mantém a cor ao longo do tempo no externo?',
        a: 'Os granulados naturais são minerais e não desbotam. A tonalidade pode escurecer ligeiramente com umidade, mas retorna ao estado original quando seco. Granulados coloridos podem ter variação conforme exposição prolongada ao UV.',
      },
      {
        q: 'Como calcular a quantidade para cobertura de jardim?',
        a: 'Depende da espessura de cobertura desejada. Para 3 cm de espessura, o consumo é aproximadamente 45 kg/m². A calculadora da Tez pede área e espessura e retorna o volume em sacos.',
      },
    ],
    href: '/nova-especificacao?produto=granulado',
  },
]

const tagStyles: Record<string, string> = {
  interno: 'bg-stone-100 text-stone-600',
  externo: 'bg-sky-50 text-sky-700',
  ambos: 'bg-amber-50 text-amber-700',
}

export default function GuiaProdutos() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-stone-800 mb-2">Guia de produtos</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            Especificações técnicas, aplicações e respostas prontas para as dúvidas mais comuns dos seus clientes.
          </p>
        </div>

        <div className="space-y-6">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
            >
              <div className="relative w-full h-52 bg-stone-100">
                <Image
                  src={produto.imagem}
                  alt={produto.nome}
                  fill
                  className="object-cover"
                  sizes="(max-width: 672px) 100vw, 672px"
                />
              </div>

              <div className="p-5">
                <span
                  className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${tagStyles[produto.tagVariant]}`}
                >
                  {produto.tag}
                </span>
                <h2 className="text-lg font-medium text-stone-800 mb-1">{produto.nome}</h2>
                <p className="text-sm text-stone-500 leading-relaxed mb-5">{produto.descricao}</p>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  {produto.specs.map((spec) => (
                    <div key={spec.label} className="bg-stone-50 rounded-xl p-3">
                      <div className="text-xs text-stone-400 mb-0.5">{spec.label}</div>
                      <div className="text-xs font-medium text-stone-700 leading-snug">{spec.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-5">
                  <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
                    Perguntas frequentes
                  </p>
                  <div className="space-y-3">
                    {produto.faqs.map((faq, i) => (
                      <div key={i} className="border-t border-stone-100 pt-3">
                        <p className="text-sm font-medium text-stone-700 mb-1">{faq.q}</p>
                        <p className="text-sm text-stone-500 leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={produto.href}
                  className="block w-full text-center text-sm font-medium bg-stone-800 text-white rounded-xl py-3 hover:bg-stone-700 transition-colors"
                >
                  Calcular quantidade →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

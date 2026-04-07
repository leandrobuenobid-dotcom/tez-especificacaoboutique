export interface EntradaCalculo {
  categoriaId: string
  produtoId: string
  cor?: string
  linha?: string
  granulometria?: string
  tipoAplicacao?: string
  ambiente?: string
  tipoBase?: string
  tipoTrafego?: string
  area: number
  perda: number // percentual ex: 8
  usarPrimer?: boolean
  usarFundo?: boolean
  usarTela?: boolean
  precos?: Record<string, number>
}

export interface ItemResultado {
  nome: string
  sku?: string
  quantidade: number
  unidade: string
  pesoEmbalagem?: number
  tipoRelacao?: 'principal' | 'obrigatorio' | 'recomendado' | 'opcional'
  precoUnit?: number
  subtotal?: number
  observacao?: string
}

export interface ResultadoCalculo {
  entradaSnapshot: EntradaCalculo
  areaLiquida: number
  perdaAplicada: number
  areaComPerda: number
  itens: ItemResultado[]
  alertas: string[]
  totalGeral: number
  versaoRegra: string
  calculadoEm: string
}

export function calcular(entrada: EntradaCalculo): ResultadoCalculo {
  const areaLiquida = entrada.area
  const perdaFrac = entrada.perda / 100
  const areaComPerda = parseFloat((areaLiquida * (1 + perdaFrac)).toFixed(4))
  const precos = entrada.precos || {}
  const itens: ItemResultado[] = []
  const alertas: string[] = []

  function ceil(v: number) { return Math.ceil(v) }
  function sub(qtd: number, pu: number) { return parseFloat((qtd * pu).toFixed(2)) }

  // ── CIMENTO QUEIMADO ──────────────────────────────────────────
  if (entrada.categoriaId === 'cimento') {
    const rend = 17.5
    const baldes = ceil(areaComPerda / rend)
    const pu = precos['principal'] || 0
    itens.push({
      nome: `Cimento Queimado ${entrada.linha} — ${entrada.cor}`,
      sku: entrada.linha === 'Matte' ? 'CQ-MATTE' : 'CQ-LUNAR',
      quantidade: baldes,
      unidade: `balde(s) de 5,7 kg`,
      tipoRelacao: 'principal',
      precoUnit: pu,
      subtotal: sub(baldes, pu),
      observacao: `Rendimento: ${rend} m²/balde`,
    })

    if (entrada.linha === 'Lunar') {
      alertas.push('Linha Lunar: uso exclusivo em ambientes internos.')
      alertas.push('Acabamento perolizado — não indicado para áreas externas.')
    }
    if (entrada.tipoAplicacao === 'Porta de Madeira' || entrada.tipoAplicacao === 'Movelaria') {
      alertas.push('Lixar bem a superfície antes de aplicar. MDF cru requer tratamento prévio.')
    }

    itens.push({
      nome: 'Primer',
      sku: 'PR-CIM',
      quantidade: 0,
      unidade: 'unidade',
      tipoRelacao: 'recomendado',
      precoUnit: precos['primer'] || 0,
      subtotal: 0,
      observacao: 'Quantidade conforme tipo de base — verificar com técnico Tez',
    })
    itens.push({
      nome: 'Cera Acrílica',
      sku: 'CE-ACR',
      quantidade: 0,
      unidade: 'unidade',
      tipoRelacao: 'recomendado',
      precoUnit: precos['cera'] || 0,
      subtotal: 0,
      observacao: 'Proteção e acabamento final',
    })
  }

  // ── CRISTAL DE PEDRAS NATURAIS ────────────────────────────────
  if (entrada.categoriaId === 'cristal') {
    const consumoKg = entrada.granulometria === '#10' ? 5 : 3.83
    const baldes = ceil((areaComPerda * consumoKg) / 23)
    const pu = precos['principal'] || 0
    itens.push({
      nome: `Cristal de Pedra Natural — ${entrada.cor} ${entrada.granulometria}`,
      sku: entrada.granulometria === '#10' ? 'CR-10' : 'CR-20',
      quantidade: baldes,
      unidade: 'balde(s) de 23 kg',
      tipoRelacao: 'principal',
      precoUnit: pu,
      subtotal: sub(baldes, pu),
      observacao: `Consumo: ${consumoKg} kg/m²`,
    })

    if (entrada.usarPrimer !== false) {
      const primerKg = areaComPerda * 0.4
      const b4 = ceil(primerKg / 4)
      const b21 = ceil(primerKg / 21)
      const usar4 = b4 <= 3
      const qtdP = usar4 ? b4 : b21
      const undP = usar4 ? 'balde(s) de 4 kg' : 'balde(s) de 21 kg'
      const skuP = usar4 ? 'PR-CR4' : 'PR-CR21'
      const puP = precos['primer'] || 0
      itens.push({
        nome: 'Primer Cristal',
        sku: skuP,
        quantidade: qtdP,
        unidade: undP,
        tipoRelacao: 'obrigatorio',
        precoUnit: puP,
        subtotal: sub(qtdP, puP),
        observacao: 'Embalagem escolhida automaticamente para menor sobra',
      })
    }

    if (entrada.usarFundo !== false) {
      const qtdF = ceil((areaComPerda * 0.14) / 14)
      const puF = precos['fundo'] || 0
      itens.push({
        nome: 'Fundo Preparador',
        sku: 'FU-PREP',
        quantidade: qtdF,
        unidade: 'balde(s) de 14 L',
        tipoRelacao: 'recomendado',
        precoUnit: puF,
        subtotal: sub(qtdF, puF),
        observacao: 'Consumo: 0,14 L/m²',
      })
    }

    alertas.push('Verificar preparação da base antes da aplicação.')
    alertas.push('Confirmar cor de primer recomendada para a referência selecionada.')
  }

  // ── PISO DRENANTE RESINADO ────────────────────────────────────
  if (entrada.categoriaId === 'drenante') {
    const tb = entrada.tipoBase
    const tt = entrada.tipoTrafego
    let consumoM2 = 16

    if (tb === 'Solo Natural') consumoM2 = 24
    else if (tb === 'Contrapiso' && tt === 'Tráfego Pesado') consumoM2 = 24
    else if (tb === 'Contrapiso') consumoM2 = 16
    else if (tb === 'Concreto Drenante' && tt === 'Tráfego Pesado') consumoM2 = 30
    else if (tb === 'Concreto Drenante') {
      alertas.push('Concreto drenante normalmente é aplicado com tráfego pesado. Confirme com suporte técnico Tez.')
      consumoM2 = 30
    }

    const kits = ceil((areaComPerda * consumoM2) / 16)
    const pu = precos['principal'] || 0
    itens.push({
      nome: `Piso Drenante Resinado — ${entrada.cor}`,
      sku: 'PD-KIT',
      quantidade: kits,
      unidade: 'kit(s) de 16 kg',
      tipoRelacao: 'principal',
      precoUnit: pu,
      subtotal: sub(kits, pu),
      observacao: `Base: ${tb} · Tráfego: ${tt} · Consumo: ${consumoM2} kg/m²`,
    })

    if (entrada.usarPrimer !== false) {
      const qtdP = ceil((areaComPerda * 0.2) / 4)
      const puP = precos['primer'] || 0
      itens.push({
        nome: 'Primer PU',
        sku: 'PR-PU4',
        quantidade: qtdP,
        unidade: 'embalagem(ns) de 4 kg',
        tipoRelacao: 'obrigatorio',
        precoUnit: puP,
        subtotal: sub(qtdP, puP),
        observacao: 'Consumo: 0,2 kg/m²',
      })
    }

    if (entrada.usarTela !== false) {
      const rolos = ceil((areaComPerda * 1.05) / 50)
      const puT = precos['tela'] || 0
      itens.push({
        nome: 'Tela de Fibra de Vidro',
        sku: 'TE-FIB',
        quantidade: rolos,
        unidade: 'rolo(s) de 50 m²',
        tipoRelacao: 'recomendado',
        precoUnit: puT,
        subtotal: sub(rolos, puT),
        observacao: '1 rolo cobre 50 m²',
      })
    }

    const lib = tt === 'Pedestres' ? '24 horas' : tt === 'Veículos Leves' ? '72 horas' : '7 dias'
    alertas.push('Indicado exclusivamente para áreas externas.')
    alertas.push('Não aplicar sobre bases fissuradas ou instáveis.')
    alertas.push(`Liberação para ${tt}: ${lib}.`)
    alertas.push('Garantia de 36 meses quando aplicado conforme especificações Tez.')
    alertas.push('Aplicação obrigatória por equipe credenciada Tez.')
  }

  // ── GRANULADO ─────────────────────────────────────────────────
  if (entrada.categoriaId === 'granulado') {
    const baldes = ceil((areaComPerda * 8) / 23)
    const pu = precos['principal'] || 0
    itens.push({
      nome: `Granulado Tez — ${entrada.cor}`,
      sku: 'GR-BAL',
      quantidade: baldes,
      unidade: 'balde(s) de 23 kg',
      tipoRelacao: 'principal',
      precoUnit: pu,
      subtotal: sub(baldes, pu),
      observacao: 'Consumo: 8 kg/m²',
    })

    if (entrada.usarPrimer !== false) {
      itens.push({
        nome: 'Primer',
        sku: 'PR-CIM',
        quantidade: 0,
        unidade: 'unidade',
        tipoRelacao: 'recomendado',
        precoUnit: precos['primer'] || 0,
        subtotal: 0,
        observacao: 'Quantidade conforme tipo de base',
      })
    }

    alertas.push('Uso interno e externo em paredes e tetos.')
    alertas.push('Confirmar dados técnicos com a Tez antes de emitir orçamento final.')
  }

  // ── TOTAL ─────────────────────────────────────────────────────
  const totalGeral = parseFloat(
    itens.reduce((acc, i) => acc + (i.subtotal || 0), 0).toFixed(2)
  )

  return {
    entradaSnapshot: entrada,
    areaLiquida,
    perdaAplicada: entrada.perda,
    areaComPerda: parseFloat(areaComPerda.toFixed(2)),
    itens,
    alertas,
    totalGeral,
    versaoRegra: '1.0.0',
    calculadoEm: new Date().toISOString(),
  }
}

export function gerarResumoTexto(resultado: ResultadoCalculo, boutique: string, vendedor: string): string {
  const d = new Date(resultado.calculadoEm).toLocaleDateString('pt-BR')
  const { entradaSnapshot: e } = resultado
  const linhas: string[] = []

  linhas.push(`ESPECIFICAÇÃO TEZ — ${d}`)
  linhas.push(`Boutique: ${boutique} · Vendedor: ${vendedor}`)
  linhas.push('─'.repeat(40))

  const principal = resultado.itens.find(i => i.tipoRelacao === 'principal')
  if (principal) linhas.push(`Produto: ${principal.nome}`)
  if (e.tipoAplicacao) linhas.push(`Aplicação: ${e.tipoAplicacao}`)
  if (e.ambiente) linhas.push(`Ambiente: ${e.ambiente}`)
  if (e.tipoBase) linhas.push(`Base: ${e.tipoBase}`)
  if (e.tipoTrafego) linhas.push(`Tráfego: ${e.tipoTrafego}`)
  linhas.push(`Área: ${resultado.areaLiquida.toFixed(1)} m² · Perda: ${resultado.perdaAplicada}% · Com perda: ${resultado.areaComPerda.toFixed(1)} m²`)
  linhas.push('')

  const itensCom = resultado.itens.filter(i => i.quantidade > 0)
  linhas.push('MATERIAIS')
  itensCom.forEach(i => {
    let l = `  • ${i.nome}: ${i.quantidade} ${i.unidade}`
    if (i.precoUnit && i.precoUnit > 0) {
      l += ` — R$ ${i.precoUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} un = R$ ${(i.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }
    linhas.push(l)
  })

  if (resultado.totalGeral > 0) {
    linhas.push('')
    linhas.push(`TOTAL ESTIMADO: R$ ${resultado.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  }

  if (resultado.alertas.length) {
    linhas.push('')
    linhas.push('OBSERVAÇÕES')
    resultado.alertas.slice(0, 3).forEach(a => linhas.push(`  • ${a}`))
  }

  linhas.push('')
  linhas.push('Cálculo teórico baseado nas regras Tez. Sujeito a variações de aplicação.')

  return linhas.join('\n')
}

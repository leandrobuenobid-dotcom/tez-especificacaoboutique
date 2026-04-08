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
  perda: number
  usarPrimer?: boolean
  usarFundo?: boolean
  usarTela?: boolean
  usarCera?: boolean
  consumoPrimer?: number
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

  if (entrada.categoriaId === 'ciment

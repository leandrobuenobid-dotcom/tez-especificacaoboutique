import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

export interface Boutique {
  id: string
  nome: string
  cidade: string
  estado: string
  status: 'ativo' | 'inativo'
  criadoEm: string
}

export interface Usuario {
  id: string
  boutiqueId: string
  nome: string
  email: string
  senhaHash: string
  perfil: 'vendedor' | 'gerente' | 'admin'
  status: 'ativo' | 'inativo'
  criadoEm: string
}

export interface RegraCalculo {
  tipoAplicacao?: string
  ambiente?: string
  tipoBase?: string
  tipoTrafego?: string
  consumoPorM2?: number
  rendimentoPorEmbalagem?: number
  rendimentoMin?: number
  rendimentoMax?: number
  rendimentoOperacional?: number
  perdaPadrao: number
}

export interface Complementar {
  produtoId: string
  tipoRelacao: 'obrigatorio' | 'recomendado' | 'opcional'
  consumoPorM2?: number
  rendimentoEmbalagem?: number
  observacao?: string
}

export interface Produto {
  id: string
  categoriaId: string
  sku: string
  nome: string
  linha?: string
  cor?: string
  referencia?: string
  granulometria?: string
  unidadeVenda: string
  pesoEmbalagem: number
  ativo: boolean
  regras: RegraCalculo[]
  complementares: Complementar[]
  alertas: string[]
  criadoEm: string
}

export interface Simulacao {
  id: string
  boutiqueId: string
  usuarioId: string
  categoria: string
  produto: string
  payloadEntrada: object
  resultado: object
  criadoEm: string
}

export interface DB {
  boutiques: Boutique[]
  usuarios: Usuario[]
  produtos: Produto[]
  simulacoes: Simulacao[]
}

function seedDB(): DB {
  const senhaAdmin = bcrypt.hashSync('tez@2024', 10)
  const senhaVendedor = bcrypt.hashSync('senha123', 10)

  const boutiqueTez: Boutique = {
    id: 'b-tez',
    nome: 'Tez — Matriz',
    cidade: 'Aparecida de Goiânia',
    estado: 'GO',
    status: 'ativo',
    criadoEm: new Date().toISOString(),
  }

  const boutiqueDemo: Boutique = {
    id: 'b-demo',
    nome: 'Boutique Demo',
    cidade: 'Goiânia',
    estado: 'GO',
    status: 'ativo',
    criadoEm: new Date().toISOString(),
  }

  const usuarios: Usuario[] = [
    {
      id: 'u-admin',
      boutiqueId: 'b-tez',
      nome: 'Admin Tez',
      email: 'admin@tez.com.br',
      senhaHash: senhaAdmin,
      perfil: 'admin',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    },
    {
      id: 'u-gerente',
      boutiqueId: 'b-demo',
      nome: 'Gerente Demo',
      email: 'gerente@boutique.com',
      senhaHash: senhaVendedor,
      perfil: 'gerente',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    },
    {
      id: 'u-vendedor',
      boutiqueId: 'b-demo',
      nome: 'Vendedor Demo',
      email: 'vendedor@boutique.com',
      senhaHash: senhaVendedor,
      perfil: 'vendedor',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    },
  ]

  const produtos: Produto[] = [
    // --- CIMENTO QUEIMADO MATTE ---
    {
      id: 'p-cim-matte',
      categoriaId: 'cimento',
      sku: 'CQ-MATTE',
      nome: 'Cimento Queimado Linha Matte',
      linha: 'Matte',
      unidadeVenda: 'balde',
      pesoEmbalagem: 5.7,
      ativo: true,
      regras: [
        { tipoAplicacao: 'Parede/Teto', perdaPadrao: 5, rendimentoOperacional: 17.5, rendimentoMin: 15, rendimentoMax: 20 },
        { tipoAplicacao: 'Porta de Madeira', perdaPadrao: 8, rendimentoOperacional: 17.5 },
        { tipoAplicacao: 'Movelaria', perdaPadrao: 8, rendimentoOperacional: 17.5 },
      ],
      complementares: [
        { produtoId: 'p-primer-cim', tipoRelacao: 'recomendado', observacao: 'Conforme tipo de base' },
        { produtoId: 'p-cera-acrilica', tipoRelacao: 'recomendado', observacao: 'Proteção e acabamento' },
        { produtoId: 'p-seladora-pu', tipoRelacao: 'opcional', observacao: 'Para umidade ou alto tráfego' },
      ],
      alertas: [],
      criadoEm: new Date().toISOString(),
    },
    // --- CIMENTO QUEIMADO LUNAR ---
    {
      id: 'p-cim-lunar',
      categoriaId: 'cimento',
      sku: 'CQ-LUNAR',
      nome: 'Cimento Queimado Linha Lunar',
      linha: 'Lunar',
      unidadeVenda: 'balde',
      pesoEmbalagem: 5.7,
      ativo: true,
      regras: [
        { tipoAplicacao: 'Parede/Teto', ambiente: 'Interno', perdaPadrao: 5, rendimentoOperacional: 17.5, rendimentoMin: 15, rendimentoMax: 20 },
      ],
      complementares: [
        { produtoId: 'p-primer-cim', tipoRelacao: 'recomendado', observacao: 'Conforme tipo de base' },
        { produtoId: 'p-cera-acrilica', tipoRelacao: 'recomendado', observacao: 'Proteção e acabamento' },
      ],
      alertas: ['Linha Lunar: uso exclusivo em ambientes internos.', 'Acabamento perolizado especial.'],
      criadoEm: new Date().toISOString(),
    },
    // --- CRISTAL #20 ---
    {
      id: 'p-cristal-20',
      categoriaId: 'cristal',
      sku: 'CR-20',
      nome: 'Cristal de Pedra Natural #20',
      granulometria: '#20',
      unidadeVenda: 'balde',
      pesoEmbalagem: 23,
      ativo: true,
      regras: [{ perdaPadrao: 5, consumoPorM2: 3.83, rendimentoPorEmbalagem: 6 }],
      complementares: [
        { produtoId: 'p-primer-cristal-4', tipoRelacao: 'obrigatorio', consumoPorM2: 0.4, rendimentoEmbalagem: 4 },
        { produtoId: 'p-primer-cristal-21', tipoRelacao: 'obrigatorio', consumoPorM2: 0.4, rendimentoEmbalagem: 21 },
        { produtoId: 'p-fundo-prep', tipoRelacao: 'recomendado', consumoPorM2: 0.14, rendimentoEmbalagem: 14 },
      ],
      alertas: ['Verificar preparação da base. Confirmar cor do primer para a referência selecionada.'],
      criadoEm: new Date().toISOString(),
    },
    // --- CRISTAL #10 ---
    {
      id: 'p-cristal-10',
      categoriaId: 'cristal',
      sku: 'CR-10',
      nome: 'Cristal de Pedra Natural #10',
      granulometria: '#10',
      unidadeVenda: 'balde',
      pesoEmbalagem: 23,
      ativo: true,
      regras: [{ perdaPadrao: 5, consumoPorM2: 5, rendimentoPorEmbalagem: 4.5 }],
      complementares: [
        { produtoId: 'p-primer-cristal-4', tipoRelacao: 'obrigatorio', consumoPorM2: 0.4, rendimentoEmbalagem: 4 },
        { produtoId: 'p-primer-cristal-21', tipoRelacao: 'obrigatorio', consumoPorM2: 0.4, rendimentoEmbalagem: 21 },
        { produtoId: 'p-fundo-prep', tipoRelacao: 'recomendado', consumoPorM2: 0.14, rendimentoEmbalagem: 14 },
      ],
      alertas: ['Verificar preparação da base. Confirmar cor do primer para a referência selecionada.'],
      criadoEm: new Date().toISOString(),
    },
    // --- PISO DRENANTE ---
    {
      id: 'p-drenante',
      categoriaId: 'drenante',
      sku: 'PD-KIT',
      nome: 'Piso Drenante Resinado',
      unidadeVenda: 'kit',
      pesoEmbalagem: 16,
      ativo: true,
      regras: [
        { tipoBase: 'Solo Natural', tipoTrafego: 'Pedestres', perdaPadrao: 10, consumoPorM2: 24 },
        { tipoBase: 'Solo Natural', tipoTrafego: 'Veículos Leves', perdaPadrao: 10, consumoPorM2: 24 },
        { tipoBase: 'Contrapiso', tipoTrafego: 'Pedestres', perdaPadrao: 10, consumoPorM2: 16 },
        { tipoBase: 'Contrapiso', tipoTrafego: 'Veículos Leves', perdaPadrao: 10, consumoPorM2: 16 },
        { tipoBase: 'Contrapiso', tipoTrafego: 'Tráfego Pesado', perdaPadrao: 10, consumoPorM2: 24 },
        { tipoBase: 'Concreto Drenante', tipoTrafego: 'Tráfego Pesado', perdaPadrao: 10, consumoPorM2: 30 },
      ],
      complementares: [
        { produtoId: 'p-primer-pu', tipoRelacao: 'obrigatorio', consumoPorM2: 0.2, rendimentoEmbalagem: 4 },
        { produtoId: 'p-tela-fibra', tipoRelacao: 'recomendado', rendimentoEmbalagem: 50 },
      ],
      alertas: [
        'Indicado para áreas externas. Não aplicar sobre bases fissuradas.',
        'Aplicação por equipe credenciada Tez.',
        'Garantia de 36 meses conforme especificações Tez.',
      ],
      criadoEm: new Date().toISOString(),
    },
    // --- GRANULADO ---
    {
      id: 'p-granulado',
      categoriaId: 'granulado',
      sku: 'GR-BAL',
      nome: 'Granulado Tez',
      unidadeVenda: 'balde',
      pesoEmbalagem: 23,
      ativo: true,
      regras: [{ perdaPadrao: 8, consumoPorM2: 8 }],
      complementares: [
        { produtoId: 'p-primer-cim', tipoRelacao: 'recomendado', observacao: 'Conforme tipo de base' },
      ],
      alertas: ['Uso interno e externo. Confirmar dados técnicos com a Tez antes de emitir orçamento.'],
      criadoEm: new Date().toISOString(),
    },
    // --- COMPLEMENTARES ---
    { id: 'p-primer-cim', categoriaId: 'complementar', sku: 'PR-CIM', nome: 'Primer Cimento', unidadeVenda: 'unidade', pesoEmbalagem: 1, ativo: true, regras: [], complementares: [], alertas: [], criadoEm: new Date().toISOString() },
    { id: 'p-cera-acrilica', categoriaId: 'complementar', sku: 'CE-ACR', nome: 'Cera Acrílica', unidadeVenda: 'unidade', pesoEmbalagem: 1, ativo: true, regras: [], complementares: [], alertas: [], criadoEm: new Date().toISOString() },
    { id: 'p-seladora-pu', categoriaId: 'complementar', sku: 'SE-PU', nome: 'Seladora PU', unidadeVenda: 'unidade', pesoEmbalagem: 1, ativo: true, regras: [], complementares: [], alertas: [], criadoEm: new Date().toISOString() },
    { id: 'p-primer-cristal-4', categoriaId: 'complementar', sku: 'PR-CR4', nome: 'Primer Cristal 4 kg', unidadeVenda: 'balde', pesoEmbalagem: 4, ativo: true, regras: [], complementares: [], alertas: [], criadoEm: new Date().toISOString() },
    { id: 'p-primer-cristal-21', categoriaId: 'complementar', sku: 'PR-CR21', nome: 'Primer Cristal 21 kg', unidadeVenda: 'balde', pesoEmbalagem: 21, ativo: true, regras: [], complementares: [], alertas: [], criadoEm: new Date().toISOString() },
    { id: 'p-fundo-prep', categoriaId: 'complementar', sku: 'FU-PREP', nome: 'Fundo Preparador 14 L', unidadeVenda: 'balde', pesoEmbalagem: 14, ativo: true, regras: [], complementares: [], alertas: [], criadoEm: new Date().toISOString() },
    { id: 'p-primer-pu', categoriaId: 'complementar', sku: 'PR-PU4', nome: 'Primer PU 4 kg', unidadeVenda: 'embalagem', pesoEmbalagem: 4, ativo: true, regras: [], complementares: [], alertas: [], criadoEm: new Date().toISOString() },
    { id: 'p-tela-fibra', categoriaId: 'complementar', sku: 'TE-FIB', nome: 'Tela de Fibra de Vidro', unidadeVenda: 'rolo', pesoEmbalagem: 50, ativo: true, regras: [], complementares: [], alertas: [], criadoEm: new Date().toISOString() },
  ]

  return {
    boutiques: [boutiqueTez, boutiqueDemo],
    usuarios,
    produtos,
    simulacoes: [],
  }
}

export function getDB(): DB {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = seedDB()
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2))
    return initial
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DB
}

export function saveDB(db: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

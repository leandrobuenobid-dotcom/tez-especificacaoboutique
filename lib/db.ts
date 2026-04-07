import Redis from 'ioredis'
import bcrypt from 'bcryptjs'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
let redisClient: Redis | null = null

function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, { maxRetriesPerRequest: 3 })
  }
  return redisClient
}

export interface Boutique { id: string; nome: string; cidade: string; estado: string; status: 'ativo'|'inativo'; criadoEm: string }
export interface Usuario { id: string; boutiqueId: string; nome: string; email: string; senhaHash: string; perfil: 'vendedor'|'gerente'|'admin'; status: 'ativo'|'inativo'; criadoEm: string }
export interface Produto { id: string; categoriaId: string; sku: string; nome: string; linha?: string; cor?: string; granulometria?: string; unidadeVenda: string; pesoEmbalagem: number; ativo: boolean; regras: object[]; complementares: object[]; alertas: string[]; criadoEm: string }
export interface Simulacao { id: string; boutiqueId: string; usuarioId: string; categoria: string; produto: string; payloadEntrada: object; resultado: object; criadoEm: string }
export interface DB { boutiques: Boutique[]; usuarios: Usuario[]; produtos: Produto[]; simulacoes: Simulacao[] }

async function buildSeed(): Promise<DB> {
  const senhaAdmin = bcrypt.hashSync('tez@2024', 10)
  const senhaVendedor = bcrypt.hashSync('senha123', 10)
  const now = new Date().toISOString()
  return {
    boutiques: [
      { id:'b-tez', nome:'Tez — Matriz', cidade:'Aparecida de Goiânia', estado:'GO', status:'ativo', criadoEm:now },
      { id:'b-demo', nome:'Boutique Demo', cidade:'Goiânia', estado:'GO', status:'ativo', criadoEm:now },
    ],
    usuarios: [
      { id:'u-admin', boutiqueId:'b-tez', nome:'Admin Tez', email:'admin@tez.com.br', senhaHash:senhaAdmin, perfil:'admin', status:'ativo', criadoEm:now },
      { id:'u-gerente', boutiqueId:'b-demo', nome:'Gerente Demo', email:'gerente@boutique.com', senhaHash:senhaVendedor, perfil:'gerente', status:'ativo', criadoEm:now },
      { id:'u-vendedor', boutiqueId:'b-demo', nome:'Vendedor Demo', email:'vendedor@boutique.com', senhaHash:senhaVendedor, perfil:'vendedor', status:'ativo', criadoEm:now },
    ],
    produtos: [
      { id:'p-cim-matte', categoriaId:'cimento', sku:'CQ-MATTE', nome:'Cimento Queimado Linha Matte', linha:'Matte', unidadeVenda:'balde', pesoEmbalagem:5.7, ativo:true, regras:[{tipoAplicacao:'Parede/Teto',perdaPadrao:5,rendimentoOperacional:17.5},{tipoAplicacao:'Porta de Madeira',perdaPadrao:8,rendimentoOperacional:17.5},{tipoAplicacao:'Movelaria',perdaPadrao:8,rendimentoOperacional:17.5}], complementares:[{produtoId:'p-primer-cim',tipoRelacao:'recomendado'},{produtoId:'p-cera-acrilica',tipoRelacao:'recomendado'}], alertas:[], criadoEm:now },
      { id:'p-cim-lunar', categoriaId:'cimento', sku:'CQ-LUNAR', nome:'Cimento Queimado Linha Lunar', linha:'Lunar', unidadeVenda:'balde', pesoEmbalagem:5.7, ativo:true, regras:[{tipoAplicacao:'Parede/Teto',ambiente:'Interno',perdaPadrao:5,rendimentoOperacional:17.5}], complementares:[{produtoId:'p-primer-cim',tipoRelacao:'recomendado'}], alertas:['Linha Lunar: uso exclusivo em ambientes internos.'], criadoEm:now },
      { id:'p-cristal-20', categoriaId:'cristal', sku:'CR-20', nome:'Cristal de Pedra Natural #20', granulometria:'#20', unidadeVenda:'balde', pesoEmbalagem:23, ativo:true, regras:[{perdaPadrao:5,consumoPorM2:3.83}], complementares:[{produtoId:'p-primer-cristal-4',tipoRelacao:'obrigatorio',consumoPorM2:0.4,rendimentoEmbalagem:4},{produtoId:'p-fundo-prep',tipoRelacao:'recomendado',consumoPorM2:0.14,rendimentoEmbalagem:14}], alertas:['Verificar preparação da base.'], criadoEm:now },
      { id:'p-cristal-10', categoriaId:'cristal', sku:'CR-10', nome:'Cristal de Pedra Natural #10', granulometria:'#10', unidadeVenda:'balde', pesoEmbalagem:23, ativo:true, regras:[{perdaPadrao:5,consumoPorM2:5}], complementares:[{produtoId:'p-primer-cristal-4',tipoRelacao:'obrigatorio',consumoPorM2:0.4,rendimentoEmbalagem:4},{produtoId:'p-fundo-prep',tipoRelacao:'recomendado',consumoPorM2:0.14,rendimentoEmbalagem:14}], alertas:['Verificar preparação da base.'], criadoEm:now },
      { id:'p-drenante', categoriaId:'drenante', sku:'PD-KIT', nome:'Piso Drenante Resinado', unidadeVenda:'kit', pesoEmbalagem:16, ativo:true, regras:[{tipoBase:'Solo Natural',tipoTrafego:'Pedestres',perdaPadrao:10,consumoPorM2:24},{tipoBase:'Contrapiso',tipoTrafego:'Pedestres',perdaPadrao:10,consumoPorM2:16},{tipoBase:'Contrapiso',tipoTrafego:'Tráfego Pesado',perdaPadrao:10,consumoPorM2:24},{tipoBase:'Concreto Drenante',tipoTrafego:'Tráfego Pesado',perdaPadrao:10,consumoPorM2:30}], complementares:[{produtoId:'p-primer-pu',tipoRelacao:'obrigatorio',consumoPorM2:0.2,rendimentoEmbalagem:4},{produtoId:'p-tela-fibra',tipoRelacao:'recomendado',rendimentoEmbalagem:50}], alertas:['Indicado para áreas externas.','Aplicação por equipe credenciada Tez.'], criadoEm:now },
      { id:'p-granulado', categoriaId:'granulado', sku:'GR-BAL', nome:'Granulado Tez', unidadeVenda:'balde', pesoEmbalagem:23, ativo:true, regras:[{perdaPadrao:8,consumoPorM2:8}], complementares:[{produtoId:'p-primer-cim',tipoRelacao:'recomendado'}], alertas:['Uso interno e externo.'], criadoEm:now },
      { id:'p-primer-cim', categoriaId:'complementar', sku:'PR-CIM', nome:'Primer Cimento', unidadeVenda:'unidade', pesoEmbalagem:1, ativo:true, regras:[], complementares:[], alertas:[], criadoEm:now },
      { id:'p-cera-acrilica', categoriaId:'complementar', sku:'CE-ACR', nome:'Cera Acrílica', unidadeVenda:'unidade', pesoEmbalagem:1, ativo:true, regras:[], complementares:[], alertas:[], criadoEm:now },
      { id:'p-primer-cristal-4', categoriaId:'complementar', sku:'PR-CR4', nome:'Primer Cristal 4 kg', unidadeVenda:'balde', pesoEmbalagem:4, ativo:true, regras:[], complementares:[], alertas:[], criadoEm:now },
      { id:'p-fundo-prep', categoriaId:'complementar', sku:'FU-PREP', nome:'Fundo Preparador 14 L', unidadeVenda:'balde', pesoEmbalagem:14, ativo:true, regras:[], complementares:[], alertas:[], criadoEm:now },
      { id:'p-primer-pu', categoriaId:'complementar', sku:'PR-PU4', nome:'Primer PU 4 kg', unidadeVenda:'embalagem', pesoEmbalagem:4, ativo:true, regras:[], complementares:[], alertas:[], criadoEm:now },
      { id:'p-tela-fibra', categoriaId:'complementar', sku:'TE-FIB', nome:'Tela de Fibra de Vidro', unidadeVenda:'rolo', pesoEmbalagem:50, ativo:true, regras:[], complementares:[], alertas:[], criadoEm:now },
    ],
    simulacoes: [],
  }
}

export async function getDB(): Promise<DB> {
  const redis = getRedis()
  const raw = await redis.get('tez:db')
  if (raw) return JSON.parse(raw) as DB
  const seed = await buildSeed()
  await redis.set('tez:db', JSON.stringify(seed))
  return seed
}

export async function saveDB(db: DB): Promise<void> {
  await getRedis().set('tez:db', JSON.stringify(db))
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
}

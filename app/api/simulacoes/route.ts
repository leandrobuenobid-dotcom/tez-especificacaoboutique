import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getDB, saveDB, generateId } from '@/lib/db'
import { calcular, EntradaCalculo } from '@/lib/calculo'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  const db = await getDB()
  let sims = db.simulacoes
  if (session.perfil !== 'admin') sims = sims.filter(s => s.boutiqueId === session.boutiqueId)
  const enriched = sims
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .slice(0, 50)
    .map(s => {
      const u = db.usuarios.find(u => u.id === s.usuarioId)
      const b = db.boutiques.find(b => b.id === s.boutiqueId)
      return { ...s, nomeUsuario: u?.nome || '—', nomeBoutique: b?.nome || '—' }
    })
  return NextResponse.json({ simulacoes: enriched })
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  const entrada: EntradaCalculo = await req.json()
  if (!entrada.categoriaId || !entrada.area || entrada.area <= 0) return NextResponse.json({ erro: 'Dados inválidos.' }, { status: 400 })
  const resultado = calcular(entrada)
  const db = await getDB()
  const simulacao = { id: generateId('sim'), boutiqueId: session.boutiqueId, usuarioId: session.userId, categoria: entrada.categoriaId, produto: resultado.itens[0]?.nome || '', payloadEntrada: entrada, resultado, criadoEm: new Date().toISOString() }
  db.simulacoes.push(simulacao)
  await saveDB(db)
  return NextResponse.json({ ok: true, simulacao })
}

import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getDB, saveDB, generateId } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  if (session.perfil !== 'admin') return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 })
  const db = await getDB()
  const boutiquesComUsuarios = db.boutiques.map(b => ({
    ...b,
    totalUsuarios: db.usuarios.filter(u => u.boutiqueId === b.id).length,
    totalSimulacoes: db.simulacoes.filter(s => s.boutiqueId === b.id).length,
  }))
  return NextResponse.json({ boutiques: boutiquesComUsuarios })
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session || session.perfil !== 'admin') return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 })
  const dados = await req.json()
  const db = await getDB()
  const nova = { id: generateId('b'), nome: dados.nome, cidade: dados.cidade || '', estado: dados.estado || '', status: 'ativo' as const, criadoEm: new Date().toISOString() }
  db.boutiques.push(nova)
  await saveDB(db)
  return NextResponse.json({ ok: true, boutique: nova }, { status: 201 })
}

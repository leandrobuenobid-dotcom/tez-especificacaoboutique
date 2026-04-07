import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSessionFromRequest } from '@/lib/auth'
import { getDB, saveDB, generateId } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  const db = await getDB()
  let usuarios = db.usuarios
  if (session.perfil === 'gerente') usuarios = usuarios.filter(u => u.boutiqueId === session.boutiqueId)
  else if (session.perfil === 'vendedor') return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 })
  const safe = usuarios.map(({ senhaHash: _, ...u }) => ({ ...u, boutiqueName: db.boutiques.find(b => b.id === u.boutiqueId)?.nome || '—' }))
  return NextResponse.json({ usuarios: safe })
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session || !['admin','gerente'].includes(session.perfil)) return NextResponse.json({ erro: 'Acesso negado.' }, { status: 403 })
  const { nome, email, senha, perfil, boutiqueId } = await req.json()
  if (!nome || !email || !senha || !perfil) return NextResponse.json({ erro: 'Campos obrigatórios faltando.' }, { status: 400 })
  const db = await getDB()
  if (db.usuarios.find(u => u.email === email)) return NextResponse.json({ erro: 'E-mail já cadastrado.' }, { status: 409 })
  const bid = session.perfil === 'admin' ? (boutiqueId || session.boutiqueId) : session.boutiqueId
  const novo = { id: generateId('u'), boutiqueId: bid, nome, email, senhaHash: await bcrypt.hash(senha, 10), perfil: perfil as 'vendedor'|'gerente'|'admin', status: 'ativo' as const, criadoEm: new Date().toISOString() }
  db.usuarios.push(novo)
  await saveDB(db)
  const { senhaHash: _, ...safe } = novo
  return NextResponse.json({ ok: true, usuario: safe }, { status: 201 })
}

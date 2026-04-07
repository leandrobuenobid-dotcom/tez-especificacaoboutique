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
  re

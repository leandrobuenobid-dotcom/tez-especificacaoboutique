import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDB } from '@/lib/db'
import { signToken, cookieOptions, SessionPayload } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json()
  if (!email || !senha) return NextResponse.json({ erro: 'Email e senha são obrigatórios.' }, { status: 400 })
  const db = await getDB()
  const usuario = db.usuarios.find(u => u.email === email && u.status === 'ativo')
  if (!usuario) return NextResponse.json({ erro: 'Credenciais inválidas.' }, { status: 401 })
  const senhaOk = await bcrypt.compare(senha, usuario.senhaHash)
  if (!senhaOk) return NextResponse.json({ erro: 'Credenciais inválidas.' }, { status: 401 })
  const boutique = db.boutiques.find(b => b.id === usuario.boutiqueId)
  const payload: SessionPayload = { userId: usuario.id, boutiqueId: usuario.boutiqueId, perfil: usuario.perfil, nome: usuario.nome, boutiqueName: boutique?.nome || '' }
  const token = signToken(payload)
  const opts = cookieOptions()
  const response = NextResponse.json({ ok: true, usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil, boutique: boutique?.nome } })
  response.cookies.set(opts.name, token, opts)
  return response
}

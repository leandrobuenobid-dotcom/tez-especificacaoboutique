import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getDB, saveDB, generateId, Produto } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 })
  const db = await getDB()
  const { searchParams } = new URL(req.url)
  const categoria = searchParams.get('categoria')
  const incluirCompl = searchParams.get('incluirComplementares') === 'true'
  let produtos = db.produtos
  if (categoria) produtos = produtos.filter(p => p.categoriaId === categoria)
  if (!incluirCompl) produtos = produtos.filter(p => p.categoriaId !== 'complementar')
  return NextResponse.json({ produtos })
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session || session.perfil !== 'admin') return NextResponse.json({ erro: 'Apenas admin.' }, { status: 403 })
  const dados: Omit<Produto, 'id'|'criadoEm'> = await req.json()
  const db = await getDB()
  const novo: Produto = { ...dados, id: generateId('p'), criadoEm: new Date().toISOString() }
  db.produtos.push(novo)
  await saveDB(db)
  return NextResponse.json({ ok: true, produto: novo }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session || session.perfil !== 'admin') return NextResponse.json({ erro: 'Apenas admin.' }, { status: 403 })
  const { id, ...dados } = await req.json()
  const db = await getDB()
  const idx = db.produtos.findIndex(p => p.id === id)
  if (idx === -1) return NextResponse.json({ erro: 'Não encontrado.' }, { status: 404 })
  db.produtos[idx] = { ...db.produtos[idx], ...dados }
  await saveDB(db)
  return NextResponse.json({ ok: true, produto: db.produtos[idx] })
}

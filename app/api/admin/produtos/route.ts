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
  if (

import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req)
  if (!session) return NextResponse.json({ usuario: null }, { status: 401 })
  return NextResponse.json({
    usuario: {
      nome: session.nome,
      perfil: session.perfil,
      boutiqueName: session.boutiqueName,
      boutiqueId: session.boutiqueId,
    }
  })
}

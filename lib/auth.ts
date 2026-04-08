import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'tez-secret-2024-dev'

export interface SessionPayload {
  userId: string
  boutiqueId: string
  perfil: 'vendedor' | 'gerente' | 'admin'
  nome: string
  boutiqueName: string
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  return null // Não usado mais — controle no cliente
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(authHeader.slice(7))
  }
  return null
}

export function cookieOptions() {
  return { name: 'tez-session', httpOnly: false, secure: false, sameSite: 'lax' as const, maxAge: 28800, path: '/' }
}

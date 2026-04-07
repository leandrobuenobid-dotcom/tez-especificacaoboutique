import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'tez-secret-2024-dev'
const COOKIE_NAME = 'tez-session'

export interface SessionPayload {
  userId: string
  boutiqueId: string
  perfil: 'vendedor' | 'gerente' | 'admin'
  nome: string
  boutiqueName: string
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value
  if (cookieToken) {
    const session = verifyToken(cookieToken)
    if (session) return session
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return verifyToken(token)
  }
  return null
}

export function cookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: false,
    secure: false,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8,
    path: '/',
  }
}

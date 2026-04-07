'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface SessionInfo {
  nome: string
  perfil: string
  boutiqueName: string
  boutiqueId: string
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('tez-token')
}

export function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken()
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  })
}

export function logout() {
  localStorage.removeItem('tez-token')
  localStorage.removeItem('tez-user')
  window.location.href = '/login'
}

export function getUser(): SessionInfo | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('tez-user')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export default function AuthGuard({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token || !user) { router.replace('/login'); return }
    if (adminOnly && user.perfil !== 'admin') { router.replace('/dashboard'); return }
    setOk(true)
  }, [])

  if (!ok) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-[#6B5A4E]">Carregando...</p></div>
  return <>{children}</>
}

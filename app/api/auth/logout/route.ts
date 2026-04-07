import { NextResponse } from 'next/server'
import { cookieOptions } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  const opts = cookieOptions()
  response.cookies.set(opts.name, '', { ...opts, maxAge: 0 })
  return response
}

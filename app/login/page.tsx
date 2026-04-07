'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro || 'Erro ao entrar.'); return }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-[#2C2520] tracking-widest">TEZ</h1>
          <p className="text-xs tracking-[0.2em] text-[#C4A882] mt-1 uppercase">Textura e Arte</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DFD0] p-8 shadow-sm">
          <h2 className="text-base font-medium text-[#2C2520] mb-6">Acesso ao sistema</h2>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B5A4E] tracking-wider mb-1.5 uppercase">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com.br"
                className="w-full px-3 py-2.5 border border-[#E8DFD0] rounded-lg text-sm text-[#2C2520] bg-white focus:outline-none focus:border-[#C4A882] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B5A4E] tracking-wider mb-1.5 uppercase">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-[#E8DFD0] rounded-lg text-sm text-[#2C2520] bg-white focus:outline-none focus:border-[#C4A882] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2C2520] text-white rounded-lg text-sm font-medium tracking-wide hover:bg-[#8B6B4A] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E8DFD0]">
            <p className="text-xs text-[#6B5A4E] font-medium mb-2">Acesso de demonstração:</p>
            <div className="space-y-1 text-xs text-[#6B5A4E]">
              <p><span className="font-medium">Admin:</span> admin@tez.com.br / tez@2024</p>
              <p><span className="font-medium">Gerente:</span> gerente@boutique.com / senha123</p>
              <p><span className="font-medium">Vendedor:</span> vendedor@boutique.com / senha123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

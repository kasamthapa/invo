import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../lib/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [storeSlug, setStoreSlug] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ storeSlug: storeSlug.trim(), phone: phone.trim(), password })
      navigate('/app', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Wrong phone, password, or store. Please try again.')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">INVO</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">Sign in to your store</p>
        </div>

        <div className="md:bg-[var(--bg-surface)] md:border md:border-[var(--border)] md:rounded-2xl md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1.5">
                Store slug
              </label>
              <input
                type="text"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                placeholder="sapana-closet"
                autoCapitalize="none"
                autoCorrect="off"
                required
                className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--border-2)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9800000001"
                required
                className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--border-2)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--border-2)]"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3">
                <p className="text-[var(--danger)] text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--text-primary)] text-[var(--bg-app)] font-semibold rounded-lg py-3.5 text-sm mt-2 active:opacity-80 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[var(--text-muted)] text-sm mt-8">
            New seller?{' '}
            <Link to="/register" className="text-[var(--text-primary)] font-medium hover:underline">
              Create your store
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

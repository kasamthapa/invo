import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../lib/api'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleStoreNameChange(val: string) {
    setStoreName(val)
    if (!slugEdited) {
      setStoreSlug(toSlug(val))
    }
  }

  function handleSlugChange(val: string) {
    setSlugEdited(true)
    setStoreSlug(toSlug(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!/^[a-z0-9-]+$/.test(storeSlug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens.')
      return
    }

    setLoading(true)
    try {
      await register({ storeName: storeName.trim(), storeSlug, name: name.trim(), phone: phone.trim(), password })
      navigate('/app', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('That store slug is already taken. Try a different one.')
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
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] tracking-tight">INVO</h1>
          <p className="text-[var(--color-text-2)] text-sm mt-2">Create your store</p>
        </div>

        <div className="md:bg-[var(--color-surface)] md:border md:border-[var(--color-border)] md:rounded-2xl md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[var(--color-text-2)] text-xs uppercase tracking-wider mb-1.5">
                Store name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                placeholder="Sapana Closet"
                required
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-3)] text-sm focus:outline-none focus:border-[var(--color-border-2)]"
              />
            </div>

            <div>
              <label className="block text-[var(--color-text-2)] text-xs uppercase tracking-wider mb-1.5">
                Store slug
              </label>
              <input
                type="text"
                value={storeSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="sapana-closet"
                autoCapitalize="none"
                autoCorrect="off"
                required
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-3)] text-sm focus:outline-none focus:border-[var(--color-border-2)]"
              />
              {storeSlug && (
                <p className="text-[var(--color-text-3)] text-xs mt-1.5 px-1">
                  Catalog: /shop/{storeSlug}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[var(--color-text-2)] text-xs uppercase tracking-wider mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sapana Shrestha"
                required
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-3)] text-sm focus:outline-none focus:border-[var(--color-border-2)]"
              />
            </div>

            <div>
              <label className="block text-[var(--color-text-2)] text-xs uppercase tracking-wider mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9800000001"
                required
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-3)] text-sm focus:outline-none focus:border-[var(--color-border-2)]"
              />
            </div>

            <div>
              <label className="block text-[var(--color-text-2)] text-xs uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-3)] text-sm focus:outline-none focus:border-[var(--color-border-2)]"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3">
                <p className="text-[var(--color-danger)] text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-text)] text-[var(--color-bg)] font-semibold rounded-lg py-3.5 text-sm mt-2 active:opacity-80 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Creating store…' : 'Create store'}
            </button>
          </form>

          <p className="text-center text-[var(--color-text-3)] text-sm mt-8">
            Already have a store?{' '}
            <Link to="/login" className="text-[var(--color-text)] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

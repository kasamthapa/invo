import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiFetch, ApiError, STORAGE_KEYS } from '../lib/api'

export default function Settings() {
  const { store, user } = useAuth()

  const [storeName, setStoreName] = useState(store?.name ?? '')
  const [storeMsg, setStoreMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [storeSaving, setStoreSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwSaving, setPwSaving] = useState(false)

  async function handleSaveStore(e: React.FormEvent) {
    e.preventDefault()
    if (!storeName.trim()) return
    setStoreMsg(null)
    setStoreSaving(true)
    try {
      const updated = await apiFetch<{ id: string; name: string; slug: string }>('/store/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: storeName.trim() }),
      })
      localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify({ id: updated.id, name: updated.name, slug: updated.slug }))
      setStoreMsg({ type: 'success', text: 'Store name updated.' })
    } catch (err) {
      setStoreMsg({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed to update.' })
    } finally {
      setStoreSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (newPassword.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return }
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return }
    setPwSaving(true)
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setPwMsg({ type: 'success', text: 'Password changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwMsg({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed to change password.' })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/app/more" className="text-[var(--text-muted)] active:opacity-70 hover:text-[var(--text-secondary)]">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-[var(--text-primary)] font-semibold text-lg">Settings</h1>
      </div>

      {/* Store profile */}
      <form onSubmit={(e) => void handleSaveStore(e)} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5 mb-6">
        <h2 className="text-[var(--text-primary)] font-semibold mb-4">Store Profile</h2>

        <div className="mb-3">
          <label className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Store Slug</label>
          <p className="text-[var(--text-secondary)] text-sm py-2 px-3 bg-[var(--bg-surface-2)] rounded-md border border-[var(--border)]">
            {store?.slug}
          </p>
          <p className="text-[var(--text-placeholder)] text-xs mt-1">Slug cannot be changed.</p>
        </div>

        <div className="mb-4">
          <label className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Role</label>
          <p className="text-[var(--text-secondary)] text-sm capitalize">{user?.role?.toLowerCase()}</p>
        </div>

        {storeMsg && (
          <p className={`text-sm mb-3 ${storeMsg.type === 'success' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {storeMsg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={storeSaving}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium py-2 px-4 rounded-md text-sm disabled:opacity-50 transition-colors"
        >
          {storeSaving ? 'Saving…' : 'Save'}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={(e) => void handleChangePassword(e)} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="text-[var(--text-primary)] font-semibold mb-4">Change Password</h2>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
            />
          </div>
          <div>
            <label className="block text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {pwMsg && (
          <p className={`text-sm mb-3 ${pwMsg.type === 'success' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            {pwMsg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={pwSaving}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium py-2 px-4 rounded-md text-sm disabled:opacity-50 transition-colors"
        >
          {pwSaving ? 'Changing…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}

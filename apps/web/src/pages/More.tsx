import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight, Receipt, Users, ShoppingCart, Truck, CreditCard, ExternalLink, Share2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function NavRow({
  to,
  icon: Icon,
  label,
  external,
}: {
  to: string
  icon: React.ElementType
  label: string
  external?: boolean
}) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-4 py-3.5 active:opacity-70"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-[var(--text-muted)]" />
          <span className="text-[var(--text-primary)] text-sm">{label}</span>
        </div>
        <ExternalLink size={14} className="text-[var(--text-muted)]" />
      </a>
    )
  }
  return (
    <Link to={to} className="flex items-center justify-between px-4 py-3.5 active:opacity-70">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-[var(--text-muted)]" />
        <span className="text-[var(--text-primary)] text-sm">{label}</span>
      </div>
      <ChevronRight size={16} className="text-[var(--text-muted)]" />
    </Link>
  )
}

export default function More() {
  const { logout, user, store } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const isOwner = user?.role === 'OWNER'
  const catalogUrl = store ? `${window.location.origin}/shop/${store.slug}` : ''

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  async function handleShareCatalog() {
    try {
      await navigator.clipboard.writeText(catalogUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="px-4 py-6 space-y-4 pb-10">
      {/* Store card */}
      <div className="bg-[var(--bg-surface-2)] rounded-xl p-4">
        <p className="text-[var(--text-primary)] font-bold text-lg leading-tight">{store?.name}</p>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">@{store?.slug}</p>
        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
          isOwner ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--border-2)] text-[var(--text-muted)]'
        }`}>
          {user?.role}
        </span>
      </div>

      {/* Navigation */}
      <div className="bg-[var(--bg-surface-2)] rounded-xl divide-y divide-[var(--border-2)]/60">
        <NavRow to="/app/bills" icon={Receipt} label="Bills" />
        <NavRow to="/app/customers" icon={Users} label="Customers" />
        {isOwner && (
          <>
            <NavRow to="/app/purchases" icon={ShoppingCart} label="Purchases" />
            <NavRow to="/app/suppliers" icon={Truck} label="Suppliers" />
            <NavRow to="/app/expenses" icon={CreditCard} label="Expenses" />
          </>
        )}
        <NavRow to={catalogUrl} icon={ExternalLink} label="My Catalog" external />
        <button
          onClick={() => void handleShareCatalog()}
          className="w-full flex items-center justify-between px-4 py-3.5 active:opacity-70"
        >
          <div className="flex items-center gap-3">
            <Share2 size={18} className="text-[var(--text-muted)]" />
            <span className="text-[var(--text-primary)] text-sm">Share Catalog</span>
          </div>
          <span className={`text-xs font-medium ${copied ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
            {copied ? 'Copied!' : 'Copy link'}
          </span>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={() => void handleLogout()}
        className="w-full bg-[var(--bg-surface-2)] text-red-400 font-medium rounded-xl py-3.5 text-sm active:opacity-80"
      >
        Log out
      </button>

      {/* Footer */}
      <p className="text-[var(--text-placeholder)] text-xs text-center pt-2">Invo v1.0 · Made for Nepal 🇳🇵</p>
    </div>
  )
}

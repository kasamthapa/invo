import { NavLink, Outlet } from 'react-router-dom'
import { Home, Package, CirclePlus, Users, MoreHorizontal, Receipt, ShoppingCart, Truck, CreditCard, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MOBILE_NAV = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/products', icon: Package, label: 'Products', end: false },
  { to: '/app/customers', icon: Users, label: 'Customers', end: false },
  { to: '/app/more', icon: MoreHorizontal, label: 'More', end: false },
]

const SIDEBAR_NAV = [
  { to: '/app', icon: Home, label: 'Home', end: true, ownerOnly: false },
  { to: '/app/products', icon: Package, label: 'Products', end: false, ownerOnly: false },
  { to: '/app/bill/new', icon: CirclePlus, label: 'New Bill', end: false, ownerOnly: false },
  { to: '/app/bills', icon: Receipt, label: 'Bills', end: false, ownerOnly: false },
  { to: '/app/customers', icon: Users, label: 'Customers', end: false, ownerOnly: false },
  { to: '/app/purchases', icon: ShoppingCart, label: 'Purchases', end: false, ownerOnly: true },
  { to: '/app/suppliers', icon: Truck, label: 'Suppliers', end: false, ownerOnly: true },
  { to: '/app/expenses', icon: CreditCard, label: 'Expenses', end: false, ownerOnly: true },
  { to: '/app/settings', icon: Settings, label: 'Settings', end: false, ownerOnly: false },
]

function SidebarLink({ to, icon: Icon, label, end }: { to: string; icon: React.ElementType; label: string; end: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]/50'
        }`
      }
    >
      <Icon size={18} strokeWidth={1.8} />
      {label}
    </NavLink>
  )
}

export default function AppShell() {
  const { store, user } = useAuth()
  const isOwner = user?.role === 'OWNER'

  return (
    <div className="flex h-screen bg-[var(--bg-app)]">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="px-5 pt-6 pb-4">
          <p className="text-[var(--text-primary)] font-bold text-lg tracking-tight">Invo</p>
          <p className="text-[var(--text-muted)] text-xs mt-0.5 truncate">{store?.name}</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {SIDEBAR_NAV.filter((item) => !item.ownerOnly || isOwner).map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-[var(--border)]">
          <p className="text-[var(--text-primary)] text-sm font-medium truncate">{user?.name}</p>
          <p className="text-[var(--text-muted)] text-xs capitalize">{user?.role?.toLowerCase()}</p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 h-12 border-b border-[var(--border)] bg-[var(--bg-surface)] flex-shrink-0">
          <span className="text-[var(--text-primary)] font-semibold text-base tracking-tight">
            {store?.name ?? 'Invo'}
          </span>
          <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider font-medium">
            INVO
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)]/95 backdrop-blur-sm border-t border-[var(--border)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center justify-around h-16">
            {MOBILE_NAV.slice(0, 2).map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-2 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`
                }
              >
                <Icon size={22} strokeWidth={1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}

            <NavLink
              to="/app/bill/new"
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 ${isActive ? 'opacity-100' : 'opacity-90'}`
              }
            >
              <span className="bg-[var(--accent)] rounded-full p-3 shadow-lg shadow-blue-900/20">
                <CirclePlus size={24} strokeWidth={2} className="text-[var(--text-primary)]" />
              </span>
              <span className="text-[10px] font-medium text-[var(--text-muted)]">New Bill</span>
            </NavLink>

            {MOBILE_NAV.slice(2).map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-2 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`
                }
              >
                <Icon size={22} strokeWidth={1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

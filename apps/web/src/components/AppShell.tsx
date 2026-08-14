import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Package, CirclePlus, Users, MoreHorizontal, Receipt, ShoppingCart, Truck, CreditCard, Settings, LogOut, Boxes } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MOBILE_NAV = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/products', icon: Package, label: 'Products', end: false },
  { to: '/app/customers', icon: Users, label: 'Customers', end: false },
  { to: '/app/more', icon: MoreHorizontal, label: 'More', end: false },
]

const SIDEBAR_SECTIONS: {
  label: string
  items: { to: string; icon: React.ElementType; label: string; end: boolean; ownerOnly: boolean }[]
}[] = [
  {
    label: 'Overview',
    items: [{ to: '/app', icon: Home, label: 'Dashboard', end: true, ownerOnly: false }],
  },
  {
    label: 'Sales',
    items: [
      { to: '/app/bill/new', icon: CirclePlus, label: 'New Bill', end: false, ownerOnly: false },
      { to: '/app/bills', icon: Receipt, label: 'Bills', end: false, ownerOnly: false },
      { to: '/app/customers', icon: Users, label: 'Customers', end: false, ownerOnly: false },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { to: '/app/products', icon: Package, label: 'Products', end: false, ownerOnly: false },
      { to: '/app/purchases', icon: ShoppingCart, label: 'Purchases', end: false, ownerOnly: true },
      { to: '/app/suppliers', icon: Truck, label: 'Suppliers', end: false, ownerOnly: true },
    ],
  },
  {
    label: 'Finance',
    items: [{ to: '/app/expenses', icon: CreditCard, label: 'Expenses', end: false, ownerOnly: true }],
  },
  {
    label: 'System',
    items: [{ to: '/app/settings', icon: Settings, label: 'Settings', end: false, ownerOnly: false }],
  },
]

const PAGE_TITLES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === '/app', title: 'Dashboard' },
  { match: (p) => p === '/app/products/new', title: 'Add Product' },
  { match: (p) => /^\/app\/products\/[^/]+\/edit$/.test(p), title: 'Edit Product' },
  { match: (p) => /^\/app\/products\/[^/]+$/.test(p), title: 'Product' },
  { match: (p) => p.startsWith('/app/products'), title: 'Products' },
  { match: (p) => p === '/app/bill/new', title: 'New Bill' },
  { match: (p) => /^\/app\/bills\/[^/]+$/.test(p), title: 'Bill' },
  { match: (p) => p.startsWith('/app/bills'), title: 'Bills' },
  { match: (p) => /^\/app\/customers\/[^/]+$/.test(p), title: 'Customer' },
  { match: (p) => p.startsWith('/app/customers'), title: 'Customers' },
  { match: (p) => p.startsWith('/app/purchases'), title: 'Purchases' },
  { match: (p) => p.startsWith('/app/suppliers'), title: 'Suppliers' },
  { match: (p) => p.startsWith('/app/expenses'), title: 'Expenses' },
  { match: (p) => p.startsWith('/app/settings'), title: 'Settings' },
  { match: (p) => p.startsWith('/app/more'), title: 'More' },
]

function getPageTitle(pathname: string): string {
  return PAGE_TITLES.find((entry) => entry.match(pathname))?.title ?? 'Invo'
}

function initials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}

function SidebarLink({ to, icon: Icon, label, end }: { to: string; icon: React.ElementType; label: string; end: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 pl-2.5 pr-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
          isActive
            ? 'bg-[var(--accent-light)] text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full transition-opacity ${
              isActive ? 'bg-[var(--accent)] opacity-100' : 'opacity-0'
            }`}
          />
          <Icon size={17} strokeWidth={1.8} />
          {label}
        </>
      )}
    </NavLink>
  )
}

export default function AppShell() {
  const { store, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isOwner = user?.role === 'OWNER'
  const pageTitle = getPageTitle(location.pathname)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[var(--bg-app)]">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-4">
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-[var(--accent)] text-white flex-shrink-0">
            <Boxes size={17} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[var(--text-primary)] font-bold text-base leading-tight tracking-tight">Invo</p>
            <p className="text-[var(--text-muted)] text-xs truncate leading-tight">{store?.name}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-4 overflow-y-auto pt-1">
          {SIDEBAR_SECTIONS.map((section) => {
            const items = section.items.filter((item) => !item.ownerOnly || isOwner)
            if (items.length === 0) return null
            return (
              <div key={section.label}>
                <p className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <SidebarLink key={item.to} {...item} />
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="flex items-center gap-2.5 px-4 py-4 border-t border-[var(--border)]">
          <span className="flex items-center justify-center h-8 w-8 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-secondary)] text-xs font-semibold flex-shrink-0">
            {initials(user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[var(--text-primary)] text-sm font-medium truncate leading-tight">{user?.name}</p>
            <p className="text-[var(--text-muted)] text-xs capitalize leading-tight">{user?.role?.toLowerCase()}</p>
          </div>
          <button
            onClick={() => void handleLogout()}
            title="Log out"
            className="flex items-center justify-center h-7 w-7 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors flex-shrink-0"
          >
            <LogOut size={15} strokeWidth={1.8} />
          </button>
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

        {/* Desktop topbar */}
        <header className="hidden md:flex items-center justify-between px-8 h-14 border-b border-[var(--border)] bg-[var(--bg-surface)] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-[var(--text-primary)] text-[15px] font-semibold truncate">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                isOwner
                  ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                  : 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)]'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {isOwner ? 'Owner' : 'Staff'}
            </span>
          </div>
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

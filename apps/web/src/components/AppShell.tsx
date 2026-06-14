import { NavLink, Outlet } from 'react-router-dom'
import { Home, Package, CirclePlus, Users, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/products', icon: Package, label: 'Products', end: false },
  { to: '/app/customers', icon: Users, label: 'Customers', end: false },
  { to: '/app/more', icon: MoreHorizontal, label: 'More', end: false },
]

export default function AppShell() {
  const { store } = useAuth()

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col max-w-[480px] mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-12 bg-zinc-800/95 border-b border-zinc-700 flex-shrink-0">
        <span className="text-white font-semibold text-base tracking-tight">
          {store?.name ?? 'Invo'}
        </span>
        <span className="text-zinc-400 text-xs uppercase tracking-wider font-medium">
          INVO
        </span>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-zinc-800/95 border-t border-zinc-700"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16">
          {/* Left two items */}
          {NAV_ITEMS.slice(0, 2).map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 ${isActive ? 'text-white' : 'text-zinc-500'}`
              }
            >
              <Icon size={22} strokeWidth={1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}

          {/* Center: New Bill */}
          <NavLink
            to="/app/bill/new"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 ${isActive ? 'opacity-100' : 'opacity-90'}`
            }
          >
            <span className="bg-emerald-500 rounded-full p-3 shadow-lg shadow-emerald-900/40">
              <CirclePlus size={24} strokeWidth={2} className="text-white" />
            </span>
            <span className="text-[10px] font-medium text-zinc-400">New Bill</span>
          </NavLink>

          {/* Right two items */}
          {NAV_ITEMS.slice(2).map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 ${isActive ? 'text-white' : 'text-zinc-500'}`
              }
            >
              <Icon size={22} strokeWidth={1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

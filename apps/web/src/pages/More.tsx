import { useNavigate, Link } from 'react-router-dom'
import { ChevronRight, Receipt } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function More() {
  const { logout, user, store } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="bg-zinc-800 rounded-xl p-4">
        <p className="text-white font-semibold">{user?.name}</p>
        <p className="text-zinc-400 text-sm mt-0.5">{store?.name}</p>
        <p className="text-zinc-600 text-xs mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
      </div>

      <div className="bg-zinc-800 rounded-xl divide-y divide-zinc-700">
        <Link
          to="/app/bills"
          className="flex items-center justify-between px-4 py-3.5 active:opacity-70"
        >
          <div className="flex items-center gap-3">
            <Receipt size={18} className="text-zinc-400" />
            <span className="text-white text-sm">Bills</span>
          </div>
          <ChevronRight size={16} className="text-zinc-600" />
        </Link>
      </div>

      <button
        onClick={() => void handleLogout()}
        className="w-full bg-zinc-800 text-red-400 font-medium rounded-xl py-3.5 text-sm active:opacity-80"
      >
        Log out
      </button>
    </div>
  )
}

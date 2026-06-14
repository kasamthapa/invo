import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function More() {
  const { logout, user, store } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="bg-zinc-800 rounded-xl p-4">
        <p className="text-white font-semibold">{user?.name}</p>
        <p className="text-zinc-400 text-sm mt-0.5">{store?.name}</p>
        <p className="text-zinc-600 text-xs mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-zinc-800 text-red-400 font-medium rounded-xl py-3.5 text-sm active:opacity-80"
      >
        Log out
      </button>
    </div>
  )
}

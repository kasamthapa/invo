import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <p className="text-zinc-400 text-sm">Welcome back,</p>
      <h2 className="text-white text-2xl font-bold mt-1">{user?.name ?? 'Seller'}</h2>
      <p className="text-zinc-600 text-xs mt-4">Dashboard — coming in Phase D</p>
    </div>
  )
}

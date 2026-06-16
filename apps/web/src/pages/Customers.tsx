import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Search, Plus, X, ChevronRight } from 'lucide-react'
import { useCustomers, useCreateCustomer } from '../hooks/useCustomers'
import { formatNPR } from '../utils/money'
import { ApiError } from '../lib/api'
import type { Customer } from '../types/customer'

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function CustomerRow({ customer }: { customer: Customer }) {
  return (
    <Link
      to={`/app/customers/${customer.id}`}
      className="flex items-center gap-3 px-4 py-3 active:bg-zinc-800/60"
    >
      <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-semibold">{initials(customer.name)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{customer.name}</p>
        {customer.phone && (
          <p className="text-zinc-500 text-xs mt-0.5">{customer.phone}</p>
        )}
        <p className="text-zinc-600 text-xs mt-0.5">
          {customer.totalOrders} {customer.totalOrders === 1 ? 'order' : 'orders'} ·{' '}
          {formatNPR(customer.totalSpent)}
        </p>
      </div>
      <ChevronRight size={16} className="text-zinc-600 flex-shrink-0" />
    </Link>
  )
}

function AddCustomerSheet({ onClose }: { onClose: () => void }) {
  const create = useCreateCustomer()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) { setError('Name is required'); return }
    setError(null)
    try {
      await create.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        note: note.trim() || undefined,
      })
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'A customer with this phone already exists.'
          : 'Failed to add customer.',
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-t-2xl px-4 pt-5 pb-8 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-semibold text-base">Add Customer</h3>
          <button onClick={onClose} className="text-zinc-400 active:opacity-70">
            <X size={20} />
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {[
          { label: 'Name *', value: name, onChange: setName, type: 'text', placeholder: 'Priya Sharma' },
          { label: 'Phone', value: phone, onChange: setPhone, type: 'tel', placeholder: '98XXXXXXXX' },
          { label: 'Address', value: address, onChange: setAddress, type: 'text', placeholder: 'Lalitpur, Nepal' },
          { label: 'Note', value: note, onChange: setNote, type: 'text', placeholder: 'Optional note' },
        ].map(({ label, value, onChange, type, placeholder }) => (
          <div key={label}>
            <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">{label}</label>
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 outline-none focus:border-zinc-500"
            />
          </div>
        ))}

        <button
          onClick={() => void handleSubmit()}
          disabled={create.isPending}
          className="w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-xl active:opacity-80 disabled:opacity-50 mt-2"
        >
          {create.isPending ? 'Saving…' : 'Add Customer'}
        </button>
      </div>
    </div>
  )
}

export default function Customers() {
  const { data: customers, isLoading, isError, refetch } = useCustomers()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = customers?.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || (c.phone ?? '').includes(q)
  }) ?? []

  return (
    <div className="flex flex-col min-h-full">
      {showAdd && <AddCustomerSheet onClose={() => setShowAdd(false)} />}

      <div className="sticky top-0 z-10 bg-zinc-900 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">Customers</h1>
            {customers && <p className="text-zinc-400 text-xs">{customers.length} customers</p>}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg active:opacity-80"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 text-white text-sm placeholder-zinc-500 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <p className="text-zinc-400 text-sm">Couldn't load customers.</p>
          <button onClick={() => void refetch()} className="text-emerald-400 text-sm font-medium">
            Tap to retry
          </button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <Users size={40} className="text-zinc-700" />
          {search ? (
            <p className="text-zinc-500 text-sm">No customers match "{search}"</p>
          ) : (
            <>
              <p className="text-zinc-400 text-sm">No customers yet.</p>
              <p className="text-zinc-600 text-xs">
                Customers are saved when you add them to a bill.
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl active:opacity-80"
              >
                Add Customer
              </button>
            </>
          )}
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="divide-y divide-zinc-800/50">
          {filtered.map((c) => <CustomerRow key={c.id} customer={c} />)}
        </div>
      )}
    </div>
  )
}

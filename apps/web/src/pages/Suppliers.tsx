import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Plus, X, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../hooks/useSuppliers'
import { formatDate } from '../utils/money'
import type { Supplier } from '../types/supplier'

function OwnerGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 px-6 text-center">
      <p className="text-zinc-400 text-sm font-medium">Owner access required</p>
      <p className="text-zinc-600 text-xs">This section is only available to store owners.</p>
    </div>
  )
}

function SupplierSheet({
  supplier,
  onClose,
}: {
  supplier?: Supplier
  onClose: () => void
}) {
  const create = useCreateSupplier()
  const update = useUpdateSupplier(supplier?.id ?? '')
  const [name, setName] = useState(supplier?.name ?? '')
  const [phone, setPhone] = useState(supplier?.phone ?? '')
  const [note, setNote] = useState(supplier?.note ?? '')
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!supplier
  const isPending = create.isPending || update.isPending

  async function handleSubmit() {
    if (!name.trim()) { setError('Name is required'); return }
    setError(null)
    try {
      if (isEdit) {
        await update.mutateAsync({ name: name.trim(), phone: phone.trim() || undefined, note: note.trim() || undefined })
      } else {
        await create.mutateAsync({ name: name.trim(), phone: phone.trim() || undefined, note: note.trim() || undefined })
      }
      onClose()
    } catch {
      setError('Failed to save supplier.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-t-2xl px-4 pt-5 pb-8 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-semibold text-base">{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h3>
          <button onClick={onClose} className="text-zinc-400 active:opacity-70"><X size={20} /></button>
        </div>
        {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{error}</p>}
        {[
          { label: 'Name *', value: name, onChange: setName, placeholder: 'Kathmandu Fabrics Pvt Ltd' },
          { label: 'Phone', value: phone, onChange: setPhone, placeholder: '01-XXXXXXX' },
          { label: 'Note', value: note, onChange: setNote, placeholder: 'Optional note' },
        ].map(({ label, value, onChange, placeholder }) => (
          <div key={label}>
            <label className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 outline-none focus:border-zinc-500"
            />
          </div>
        ))}
        <button
          onClick={() => void handleSubmit()}
          disabled={isPending}
          className="w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-xl active:opacity-80 disabled:opacity-50 mt-2"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Supplier'}
        </button>
      </div>
    </div>
  )
}

export default function Suppliers() {
  const { user } = useAuth()
  const { data: suppliers, isLoading, isError, refetch } = useSuppliers()
  const deleteSupplier = useDeleteSupplier()
  const [sheet, setSheet] = useState<'add' | Supplier | null>(null)

  if (user?.role !== 'OWNER') return <OwnerGate />

  return (
    <div className="flex flex-col min-h-full">
      {sheet === 'add' && <SupplierSheet onClose={() => setSheet(null)} />}
      {sheet && sheet !== 'add' && <SupplierSheet supplier={sheet} onClose={() => setSheet(null)} />}

      <div className="sticky top-0 z-10 bg-zinc-900 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-1">
          <Link to="/app/more" className="text-zinc-400 active:opacity-70"><ChevronLeft size={20} /></Link>
          <div className="flex-1">
            <h1 className="text-white font-semibold text-lg">Suppliers</h1>
            {suppliers && <p className="text-zinc-400 text-xs">{suppliers.length} suppliers</p>}
          </div>
          <button
            onClick={() => setSheet('add')}
            className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg active:opacity-80"
          >
            <Plus size={14} />Add
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <p className="text-zinc-400 text-sm">Couldn't load suppliers.</p>
          <button onClick={() => void refetch()} className="text-emerald-400 text-sm font-medium">Tap to retry</button>
        </div>
      )}

      {!isLoading && !isError && (!suppliers || suppliers.length === 0) && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center px-6">
          <Truck size={40} className="text-zinc-700" />
          <p className="text-zinc-400 text-sm">No suppliers yet.</p>
          <button
            onClick={() => setSheet('add')}
            className="bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl active:opacity-80"
          >
            Add Supplier
          </button>
        </div>
      )}

      {!isLoading && !isError && suppliers && suppliers.length > 0 && (
        <div className="divide-y divide-zinc-800/50">
          {suppliers.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0" onClick={() => setSheet(s)} role="button">
                <p className="text-white text-sm font-medium truncate">{s.name}</p>
                {s.phone && <p className="text-zinc-500 text-xs mt-0.5">{s.phone}</p>}
                {s.note && <p className="text-zinc-600 text-xs mt-0.5 truncate">{s.note}</p>}
                <p className="text-zinc-700 text-xs mt-0.5">Added {formatDate(s.createdAt)}</p>
              </div>
              <button
                onClick={() => {
                  if (!confirm(`Delete ${s.name}?`)) return
                  void deleteSupplier.mutateAsync(s.id)
                }}
                className="text-zinc-600 active:text-red-400 px-2 py-1 text-xs"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Supplier, CreateSupplierInput } from '../types/supplier'

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiFetch<Supplier[]>('/suppliers'),
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSupplierInput) =>
      apiFetch<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function useUpdateSupplier(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<CreateSupplierInput>) =>
      apiFetch<Supplier>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/suppliers/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

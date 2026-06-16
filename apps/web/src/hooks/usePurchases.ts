import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Purchase, CreatePurchaseInput } from '../types/purchase'

export function usePurchases() {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: () => apiFetch<Purchase[]>('/purchases'),
  })
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: () => apiFetch<Purchase>(`/purchases/${id}`),
    enabled: !!id,
  })
}

export function useCreatePurchase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePurchaseInput) =>
      apiFetch<Purchase>('/purchases', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

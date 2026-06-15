import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Bill, CreateBillInput } from '../types/bill'

export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: () => apiFetch<Bill[]>('/bills'),
  })
}

export function useBill(id: string) {
  return useQuery({
    queryKey: ['bills', id],
    queryFn: () => apiFetch<Bill>(`/bills/${id}`),
    enabled: !!id,
  })
}

export function useCreateBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBillInput) =>
      apiFetch<Bill>('/bills', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useVoidBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (billId: string) =>
      apiFetch<Bill>(`/bills/${billId}/void`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      billId,
      ...input
    }: {
      billId: string
      paymentStatus: string
      paymentMethod?: string
    }) =>
      apiFetch<Bill>(`/bills/${billId}/payment`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: (_data, { billId }) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['bills', billId] })
    },
  })
}

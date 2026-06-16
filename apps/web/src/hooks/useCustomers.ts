import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { Customer, CustomerDetail, CreateCustomerInput } from '../types/customer'

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => apiFetch<Customer[]>('/customers'),
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => apiFetch<CustomerDetail>(`/customers/${id}`),
    enabled: !!id,
  })
}

export function useSearchCustomers(q: string) {
  return useQuery({
    queryKey: ['customers', 'search', q],
    queryFn: () => apiFetch<Customer[]>(`/customers/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
  })
}

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCustomerInput) =>
      apiFetch<Customer>('/customers', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<CreateCustomerInput>) =>
      apiFetch<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers', id] })
    },
  })
}

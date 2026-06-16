import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'
import type { DashboardData } from '../types/dashboard'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch<DashboardData>('/dashboard/overview'),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

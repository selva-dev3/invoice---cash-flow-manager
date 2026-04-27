import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const api = axios.create({
  baseURL: "/api/v1",
})

// --- QUERIES ---

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats")
      return data
    },
    refetchInterval: 60000,
  })
}

export function useInvoices(filters = {}) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      const { data } = await api.get("/invoices", { params: filters })
      return data
    },
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data } = await api.get(`/invoices/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await api.get("/clients")
      return data
    },
  })
}

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data } = await api.get("/expenses")
      return data
    },
  })
}

export function useReports(year: string) {
  return useQuery({
    queryKey: ["reports", year],
    queryFn: async () => {
      const { data } = await api.get(`/reports/tax-summary?year=${year}`)
      return data
    },
    enabled: !!year,
  })
}

// --- MUTATIONS ---

export function useSendInvoice() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/invoices/${id}/send`)
      return data
    },
    onSuccess: (_, id) => {
      toast.success("Invoice sent successfully!")
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["invoice", id] })
      router.refresh()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to send invoice")
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/invoices/${id}`)
      return data
    },
    onSuccess: () => {
      toast.success("Invoice deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete invoice")
    },
  })
}

export function useDuplicateInvoice() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/invoices/${id}/duplicate`)
      return data
    },
    onSuccess: (data) => {
      toast.success("Invoice duplicated!")
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      router.push(`/invoices/${data.id}/edit`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to duplicate")
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/clients/${id}`)
      return data
    },
    onSuccess: () => {
      toast.success("Client deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete client")
    },
  })
}

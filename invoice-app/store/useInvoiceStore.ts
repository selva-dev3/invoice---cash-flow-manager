import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Invoice } from '@/types'

interface InvoiceState {
  recentInvoices: Invoice[]
  setRecentInvoices: (invoices: Invoice[]) => void
  addRecentInvoice: (invoice: Invoice) => void
  clearStore: () => void
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set) => ({
      recentInvoices: [],
      setRecentInvoices: (invoices) => set({ recentInvoices: invoices }),
      addRecentInvoice: (invoice) => set((state) => ({ 
        recentInvoices: [invoice, ...state.recentInvoices].slice(0, 5) 
      })),
      clearStore: () => set({ recentInvoices: [] }),
    }),
    {
      name: 'invoice-storage',
    }
  )
)

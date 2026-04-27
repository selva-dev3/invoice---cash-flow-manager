import { ReactNode } from "react"
import { Logo } from "@/components/shared/Logo"

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Secure Client Portal
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
      <footer className="py-8 border-t bg-white mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by InvoiceFlow &bull; Secure Payments via Stripe</p>
        </div>
      </footer>
    </div>
  )
}

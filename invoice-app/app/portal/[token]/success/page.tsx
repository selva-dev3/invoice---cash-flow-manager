import { CheckCircle2, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Payment Successful!</h1>
          <p className="text-slate-500">
            Thank you for your payment. Your transaction has been processed successfully.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 w-full">
            <Link href={`/portal/${params.token}`}>
              <FileText className="mr-2 h-4 w-4" /> View Invoice
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/" className="text-slate-500">
              Return to Website
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

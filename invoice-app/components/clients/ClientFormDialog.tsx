"use client"

import { useState } from "react"
import { Plus, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ClientForm } from "./ClientForm"
import { Client } from "@/types"

interface ClientFormDialogProps {
  mode: "create" | "edit"
  client?: Client
}

export function ClientFormDialog({ mode, client }: ClientFormDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Client" : "Edit Client"}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Fill in the details below to add a new client to your directory." 
              : "Update the client's information below."}
          </DialogDescription>
        </DialogHeader>
        <ClientForm 
          mode={mode} 
          initialData={client} 
          onSuccess={handleSuccess} 
        />
      </DialogContent>
    </Dialog>
  )
}

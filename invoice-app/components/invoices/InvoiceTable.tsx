"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import { MoreHorizontal, Eye, Trash, Edit, Send, Download, Copy, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { InvoiceStatusBadge } from "./InvoiceStatusBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InvoiceStatus } from "@prisma/client"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { 
  useInvoices, 
  useDeleteInvoice, 
  useDuplicateInvoice, 
  useSendInvoice 
} from "@/hooks/use-api"

interface InvoiceWithClient {
  id: string
  invoiceNumber: string
  clientName: string
  issueDate: Date
  dueDate: Date
  total: number
  currency: string
  status: InvoiceStatus
}

export function InvoiceTable() {
  const { data: invoices, isLoading, error } = useInvoices()
  const deleteMutation = useDeleteInvoice()
  const duplicateMutation = useDuplicateInvoice()
  const sendMutation = useSendInvoice()

  const [sorting, setSorting] = useState<SortingState>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const router = useRouter()

  const columns: ColumnDef<InvoiceWithClient>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="font-medium">
          <Link href={`/invoices/${row.original.id}`} className="hover:underline text-brand-primary">
            {row.getValue("invoiceNumber")}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "clientName",
      header: "Client",
    },
    {
      accessorKey: "issueDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("issueDate")),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"))
        return <div className="font-medium">{formatCurrency(amount, row.original.currency)}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <InvoiceStatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              {invoice.status === InvoiceStatus.DRAFT && (
                <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => duplicateMutation.mutate(invoice.id)}
                disabled={duplicateMutation.isPending}
              >
                <Copy className="mr-2 h-4 w-4" /> 
                {duplicateMutation.isPending ? "Duplicating..." : "Duplicate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`/api/v1/invoices/${invoice.id}/pdf`}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </a>
              </DropdownMenuItem>
              {(invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.SENT) && (
                <DropdownMenuItem 
                  onClick={() => sendMutation.mutate(invoice.id)}
                  disabled={sendMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" /> 
                  {sendMutation.isPending ? "Sending..." : "Send Email"}
                </DropdownMenuItem>
              )}
              {invoice.status === InvoiceStatus.DRAFT && (
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => {
                    setInvoiceToDelete(invoice.id)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: invoices || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center bg-white rounded-md border">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[200px] items-center justify-center bg-white rounded-md border text-red-500">
        Error loading invoices.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => invoiceToDelete && deleteMutation.mutate(invoiceToDelete)}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? Only draft invoices can be deleted. This action cannot be undone."
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  )
}

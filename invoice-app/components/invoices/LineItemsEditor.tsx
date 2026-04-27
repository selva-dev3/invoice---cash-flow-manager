"use client"

import { Plus, Trash } from "lucide-react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { formatCurrency } from "@/lib/utils"

export function LineItemsEditor() {
  const { control, watch, getValues } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchedItems = watch("items")
  const currency = watch("currency")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Line Items</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      
      <div className="rounded-md border bg-slate-50/50 p-4">
        <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-6">
                <FormField
                  control={control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Service or product description" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                          className="text-center bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={control}
                  name={`items.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                          className="text-right bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="text-sm font-medium">
                  {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0), currency)}
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-red-600"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

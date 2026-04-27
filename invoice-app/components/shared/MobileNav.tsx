"use client"

import { Menu } from "lucide-react"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Sidebar } from "./Sidebar"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-60">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}

"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type BarangayOption = {
  id: string
  name: string
}

type BarangayComboboxProps = {
  barangays: BarangayOption[]
  value: string | null
  onSelect: (id: string, name: string) => void
  disabled?: boolean
}

export function BarangayCombobox({ barangays, value, onSelect, disabled }: BarangayComboboxProps) {
  const [open, setOpen] = useState(false)

  const selectedName = barangays.find((b) => b.id === value)?.name ?? "Select barangay"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{value ? selectedName : "Select barangay"}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search barangay..." />
          <CommandList>
            <CommandEmpty>No barangay found.</CommandEmpty>
            <CommandGroup>
              {barangays.map((b) => (
                <CommandItem
                  key={b.id}
                  value={b.name}
                  onSelect={() => {
                    onSelect(b.id, b.name)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("mr-2 size-4", value === b.id ? "opacity-100" : "opacity-0")}
                  />
                  {b.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

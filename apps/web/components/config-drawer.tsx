"use client"

import { RotateCcwIcon, SettingsIcon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Config() {
  const { theme, setTheme } = useTheme()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open settings drawer">
          <SettingsIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Display Settings</SheetTitle>
          <SheetDescription>Theme-only configuration for this phase.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
            Light
          </Button>
          <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
            Dark
          </Button>
          <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")}>
            System
          </Button>
          <Button variant="secondary" onClick={() => setTheme("system")}>
            <RotateCcwIcon />
            Reset to System
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

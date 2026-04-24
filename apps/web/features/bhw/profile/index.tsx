"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, UserCircle2, Mail, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { DashboardViewer } from "@/features/navigation/data/types"

type BhwProfilePageProps = {
  viewer: DashboardViewer
}

export function BhwProfilePage({ viewer }: BhwProfilePageProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account information</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 pb-4">
          <Avatar className="size-20">
            <AvatarImage src={viewer.avatarUrl ?? undefined} alt={viewer.name} />
            <AvatarFallback className="text-xl font-semibold">{viewer.initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-lg font-semibold">{viewer.name}</p>
            <Badge variant="secondary" className="mt-1 capitalize">
              Barangay Health Worker
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-0 p-0">
          <div className="flex items-center gap-3 px-4 py-3">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="truncate text-sm font-medium">{viewer.email}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3 px-4 py-3">
            <Shield className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium capitalize">Barangay Health Worker</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3 px-4 py-3">
            <UserCircle2 className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="truncate font-mono text-xs text-muted-foreground">{viewer.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        size="lg"
        className="w-full gap-2"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="size-4" />
        {isLoggingOut ? "Signing out…" : "Sign Out"}
      </Button>
    </section>
  )
}

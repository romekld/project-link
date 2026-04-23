import { redirect } from "next/navigation"
import { getRoleHome } from "@/features/navigation/data/role-policy"
import { createClient } from "@/lib/supabase/server"

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const roleHome = getRoleHome(profile?.role)

  if (!roleHome) {
    await supabase.auth.signOut()
    redirect("/login")
  }

  redirect(roleHome)
}

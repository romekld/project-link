import { redirect } from "next/navigation"
import { getDashboardViewer } from "@/features/navigation/queries/get-dashboard-viewer"
import { BhwProfilePage } from "@/features/bhw/profile"

export default async function Page() {
  const viewer = await getDashboardViewer()
  if (!viewer) redirect("/login")

  return <BhwProfilePage viewer={viewer} />
}

import { AdminDashboardPage } from "@/features/admin/dashboard";
import { getAdminDashboardData } from "@/features/admin/dashboard/queries";

export default async function Page() {
  const data = await getAdminDashboardData()

  return <AdminDashboardPage data={data} />
}

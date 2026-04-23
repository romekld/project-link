import { BhwDashboardPage } from "@/features/bhw/dashboard"
import { mockBhwDashboard } from "@/features/bhw/dashboard/data/mock"

export default function Page() {
  return <BhwDashboardPage {...mockBhwDashboard} />
}

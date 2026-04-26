import { BhwHouseholdsPage } from "@/features/bhw/households"
import { mockHouseholds } from "@/features/bhw/households/data/mock"

export default function Page() {
  return <BhwHouseholdsPage households={mockHouseholds} />
}

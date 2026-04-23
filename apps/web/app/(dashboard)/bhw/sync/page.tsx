import { BhwSyncPage } from "@/features/bhw/sync"
import { mockSyncQueue } from "@/features/bhw/sync/data/mock"

export default function Page() {
  return <BhwSyncPage records={mockSyncQueue} isOnline={false} />
}

import { getRoleUserCounts, getHealthStations } from '@/features/admin/users/queries'
import { AddUserPage } from '@/features/admin/users/user-editor'

export default async function Page() {
  const [roleCounts, stations] = await Promise.all([getRoleUserCounts(), getHealthStations()])
  return <AddUserPage roleCounts={roleCounts} stations={stations} />
}

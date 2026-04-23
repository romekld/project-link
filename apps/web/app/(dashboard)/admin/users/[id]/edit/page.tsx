import { notFound } from 'next/navigation'
import { getUser, getHealthStations } from '@/features/admin/users/queries'
import { EditUserPage } from '@/features/admin/users/user-editor'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const [user, stations] = await Promise.all([getUser(id), getHealthStations()])

  if (!user) notFound()

  return <EditUserPage user={user} stations={stations} />
}

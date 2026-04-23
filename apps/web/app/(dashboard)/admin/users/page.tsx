import { getUsers } from "@/features/admin/users/queries";
import { AdminUsersPage } from "@/features/admin/users";

export default async function Page() {
  const users = await getUsers()
  return <AdminUsersPage users={users} />;
}

import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserForm } from './components/user-form'

export function CreateUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link to="/admin/users" />} className="-ml-1">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <div>
        <h1 className="font-heading text-2xl font-semibold">Create User</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new user account. They will be required to change their password on first login.
        </p>
      </div>

      <UserForm mode="create" />
    </div>
  )
}

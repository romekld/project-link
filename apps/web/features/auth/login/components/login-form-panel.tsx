import { LoginBrand } from "./login-brand"
import { LoginForm } from "./login-form"

export function LoginFormPanel() {
  return (
    <section className="flex items-center justify-center p-6 lg:p-10">
      <div className="w-full max-w-xs space-y-6">
        <div className="flex items-center gap-3 lg:hidden">
          <LoginBrand compact />
        </div>
        <LoginForm />
      </div>
    </section>
  )
}
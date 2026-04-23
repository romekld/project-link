import { LoginFormPanel } from "./components/login-form-panel"
import { LoginHeroPanel } from "./components/login-hero-panel"

export function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <LoginHeroPanel />
      <LoginFormPanel />
    </div>
  )
}
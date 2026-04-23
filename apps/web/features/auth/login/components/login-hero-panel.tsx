import { LoginBrand } from "./login-brand"

export function LoginHeroPanel() {
  return (
    <section className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
      <LoginBrand />

      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-heading text-left text-4xl font-bold leading-tight tracking-tight">
          Health data,
          <br />
          connected citywide.
        </h1>
      </div>

      <p className="text-left text-sm text-primary-foreground/70">
        City Health Office II — Dasmariñas City
      </p>
    </section>
  )
}
import { Heart } from "lucide-react"

import { cn } from "@/lib/utils"

type LoginBrandProps = {
  compact?: boolean
}

export function LoginBrand({ compact = false }: LoginBrandProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-primary text-primary-foreground",
          compact ? "size-9" : "size-10"
        )}
      >
        <Heart
          className={cn("shrink-0", compact ? "size-5" : "size-6")}
          aria-hidden="true"
        />
      </div>
      <div>
        <p
          className={cn(
            "font-heading font-bold leading-none",
            compact ? "text-base" : "text-lg"
          )}
        >
          Project LINK
        </p>
        <p
          className={cn(
            "text-xs",
            compact ? "text-muted-foreground" : "text-primary-foreground/70"
          )}
        >
          Local Information Network for Kalusugan
        </p>
      </div>
    </div>
  )
}
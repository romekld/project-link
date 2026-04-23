"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps as NextThemesProviderProps,
} from "next-themes"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = Omit<ReturnType<typeof useNextTheme>, "theme" | "resolvedTheme" | "setTheme"> & {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

export function ThemeProvider({ children, ...props }: NextThemesProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const context = useNextTheme()

  return React.useMemo(
    () =>
      ({
        ...context,
        theme: (context.theme as Theme | undefined) ?? "system",
        resolvedTheme: (context.resolvedTheme as ResolvedTheme | undefined) ?? "light",
        setTheme: context.setTheme as (theme: Theme) => void,
      }) satisfies ThemeContextValue,
    [context]
  )
}

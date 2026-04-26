"use client"

import { useEffect, useState } from "react"
import { Download, Share, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    )

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (isStandalone || dismissed) return null
  if (!prompt && !isIOS) return null

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") setDismissed(true)
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2 md:bottom-4">
      <Card className="border-border shadow-lg">
        <CardContent className="flex items-center gap-3 p-3">
          {isIOS ? (
            <>
              <Share className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="flex-1 text-sm">
                Tap <strong>Share</strong> then{" "}
                <strong>Add to Home Screen</strong> to install.
              </p>
            </>
          ) : (
            <>
              <Download className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="flex-1 text-sm">Install this app for offline access.</p>
              <Button size="sm" onClick={handleInstall}>
                Install
              </Button>
            </>
          )}
          <button
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

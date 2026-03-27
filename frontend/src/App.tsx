import { RouterProvider } from '@tanstack/react-router'
import { router } from '@/app/router'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}

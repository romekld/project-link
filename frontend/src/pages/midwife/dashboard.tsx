import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSetPageMeta } from '@/contexts/page-context'
import { CheckSquare, BookOpen, FileText, Database } from 'lucide-react'

const FEATURES = [
  {
    icon: CheckSquare,
    title: 'Validation Queue',
    description: 'Review and approve BHW-submitted records before they enter the TCL.',
  },
  {
    icon: BookOpen,
    title: 'TCL Registries',
    description: 'Manage maternal care, EPI, TB, NCD, and nutrition masterlists.',
  },
  {
    icon: FileText,
    title: 'Summary Table',
    description: 'Generate end-of-month Summary Tables from validated TCL records.',
  },
  {
    icon: Database,
    title: 'Inventory',
    description: 'Track medicines, vaccines, and supplies at your health station.',
  },
]

export function MidwifeDashboardPage() {
  useSetPageMeta({ title: 'Dashboard', breadcrumbs: [{ label: 'Dashboard' }] })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Midwife Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">TCL management and record validation</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <p className="text-sm font-medium">Phase 2 features incoming</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Validation queues, TCL registries, and Summary Table generation are being built for the next release.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="opacity-70">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <feature.icon className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

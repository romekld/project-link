import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSetPageMeta } from '@/contexts/page-context'
import { mockPatients, mockEncounters } from '@/lib/mock-patients'

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-600' }
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' }
  return { label: 'Obese', color: 'text-destructive' }
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function EncounterDetailPage() {
  const { id, eid } = useParams({ strict: false }) as { id: string; eid: string }
  const navigate = useNavigate()
  const patient = mockPatients.find((p) => p.id === id)
  const encounter = mockEncounters.find((e) => e.id === eid)

  useSetPageMeta({
    title: 'Visit Details',
    breadcrumbs: [
      { label: 'Patients', href: '/bhw/patients/search' },
      { label: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient', href: `/bhw/patients/${id}` },
      { label: 'Visit Details' },
    ],
    showTitle: false,
  })

  if (!patient || !encounter) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/bhw/patients/search" />} className="-ml-1">
          <ChevronLeft data-icon="inline-start" />
          Back to Patients
        </Button>
        <p className="text-sm text-muted-foreground">
          {!patient ? 'Patient not found.' : 'Encounter not found.'}
        </p>
      </div>
    )
  }

  const bmiInfo = encounter.bmi ? bmiCategory(encounter.bmi) : null

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-1" onClick={() => navigate({ to: `/bhw/patients/${id}` })}>
        <ChevronLeft data-icon="inline-start" />
        Back to Patient
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-semibold">Visit Details</h1>
        <Badge variant={encounter.status === 'PENDING_SYNC' ? 'outline' : 'default'}>
          {encounter.status === 'PENDING_SYNC' ? 'Pending Sync' : 'Pending Validation'}
        </Badge>
      </div>

      {/* Admin metadata */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 py-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Date & Time</p>
            <p className="text-sm font-medium">{formatDateTime(encounter.date_time)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Provider ID</p>
            <p className="text-sm font-medium">{encounter.provider_id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Facility Code</p>
            <p className="text-sm font-medium">{encounter.facility_code}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* Consultation Type */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Consultation Type</h2>
          </div>
          <Tabs value={encounter.consultation_type}>
            <TabsList variant="line">
              <TabsTrigger value="New Consultation" disabled>New Consultation</TabsTrigger>
              <TabsTrigger value="Follow-up" disabled>Follow-up</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Vitals */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Vitals</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input readOnly disabled value={encounter.weight ?? ''} />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input readOnly disabled value={encounter.height ?? ''} />
            </div>
          </div>

          {encounter.bmi !== null && bmiInfo && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm">
                BMI: <span className="font-medium">{encounter.bmi}</span>
                {' \u2014 '}
                <span className={bmiInfo.color}>{bmiInfo.label}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Blood Pressure (mmHg)</Label>
              <div className="flex items-center gap-2">
                <Input readOnly disabled value={encounter.bp_systolic ?? ''} />
                <span className="text-muted-foreground">/</span>
                <Input readOnly disabled value={encounter.bp_diastolic ?? ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Temperature (&deg;C)</Label>
              <Input readOnly disabled value={encounter.temperature ?? ''} />
            </div>
          </div>
        </div>

        {/* Program Classification */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Program Classification</h2>
          </div>
          <div className="space-y-2 sm:max-w-xs">
            <Label>Program Category</Label>
            <Input readOnly disabled value={encounter.program_category} />
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Clinical Notes</h2>
          </div>
          <div className="space-y-2">
            <Label>Chief Complaint</Label>
            <Textarea readOnly disabled value={encounter.chief_complaint} />
          </div>
          <div className="space-y-2">
            <Label>Clinical Notes</Label>
            <Textarea readOnly disabled value={encounter.clinical_notes} />
          </div>
          <div className="space-y-2">
            <Label>Diagnosis / Impression</Label>
            <Textarea readOnly disabled value={encounter.diagnosis} />
          </div>
        </div>

        {/* Consent */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Consent</h2>
          </div>
          <label className="flex items-start gap-3">
            <Checkbox checked={encounter.consent_given} disabled className="mt-0.5" />
            <span className="text-sm leading-relaxed text-muted-foreground">
              Patient&apos;s informed consent was obtained as required under the Data Privacy Act of 2012 (RA 10173).
            </span>
          </label>
        </div>
      </div>

      <div className="pt-4">
        <Button variant="outline" onClick={() => navigate({ to: `/bhw/patients/${id}` })}>
          Back
        </Button>
      </div>
    </div>
  )
}

import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useSetPageMeta } from '@/contexts/page-context'
import { mockPatients, mockEncounters } from '@/lib/mock-patients'

function calculateAge(dob: string): number {
  const today = new Date()
  const d = new Date(dob)
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PatientDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const patient = mockPatients.find((p) => p.id === id)
  const encounters = mockEncounters
    .filter((e) => e.patient_id === id)
    .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())

  useSetPageMeta({
    title: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient',
    breadcrumbs: [
      { label: 'Patients', href: '/bhw/patients/search' },
      { label: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient' },
    ],
  })

  if (!patient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/bhw/patients/search" />} className="-ml-1">
          <ChevronLeft data-icon="inline-start" />
          Back to Patients
        </Button>
        <p className="text-sm text-muted-foreground">Patient not found.</p>
      </div>
    )
  }

  const fullName = `${patient.last_name}, ${patient.first_name}${patient.middle_name ? ` ${patient.middle_name}` : ''}${patient.suffix ? ` ${patient.suffix}` : ''}`

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/bhw/patients/search" />} className="-ml-1">
        <ChevronLeft data-icon="inline-start" />
        Back to Patients
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-semibold">{fullName}</h1>
        <Badge variant="secondary">{patient.id}</Badge>
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button onClick={() => navigate({ to: `/bhw/patients/${id}/encounters/new` })}>
              <Plus className="mr-2 size-4" />
              New Visit
            </Button>
          </div>

          <Card>
            <CardContent className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm font-medium">{patient.date_of_birth} ({calculateAge(patient.date_of_birth)} yrs)</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sex</p>
                <p className="text-sm font-medium">{patient.sex}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Civil Status</p>
                <p className="text-sm font-medium">{patient.civil_status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{patient.purok}, {patient.barangay}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">PhilHealth ID</p>
                <p className="text-sm font-medium">{patient.philhealth_id ?? 'Non-Member'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Socioeconomic</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {patient.is_nhts && <Badge variant="secondary">NHTS-PR</Badge>}
                  {patient.is_4ps && <Badge variant="secondary">4Ps</Badge>}
                  {patient.is_ip && <Badge variant="secondary">IP</Badge>}
                  {!patient.is_nhts && !patient.is_4ps && !patient.is_ip && (
                    <span className="text-sm text-muted-foreground">&mdash;</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4 pt-4">
          {encounters.length === 0 ? (
            <div className="space-y-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
              <Button onClick={() => navigate({ to: `/bhw/patients/${id}/encounters/new` })}>
                Start First Visit
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {encounters.map((enc) => (
                <Card
                  key={enc.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => navigate({ to: `/bhw/patients/${id}/encounters/${enc.id}` })}
                >
                  <CardContent className="flex items-center gap-4 py-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{formatDate(enc.date_time)}</span>
                        <span className="text-xs text-muted-foreground">{enc.consultation_type}</span>
                        <Badge variant="secondary">{enc.program_category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{enc.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">
                        {enc.bp_systolic && enc.bp_diastolic
                          ? `BP: ${enc.bp_systolic}/${enc.bp_diastolic} mmHg`
                          : ''}
                        {enc.weight ? ` \u00b7 Weight: ${enc.weight} kg` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={enc.status === 'PENDING_SYNC' ? 'outline' : 'default'}>
                        {enc.status === 'PENDING_SYNC' ? 'Pending Sync' : 'Pending Validation'}
                      </Badge>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

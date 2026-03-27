import { useState, useMemo } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSetPageMeta } from '@/contexts/page-context'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { mockPatients, mockEncounters } from '@/lib/mock-patients'
import type { ConsultationType, ProgramCategory, Encounter } from '@/types/patients'

function calculateBMI(weight: number | null, height: number | null): number | null {
  if (!weight || !height || height === 0) return null
  const heightM = height / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-600' }
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' }
  return { label: 'Obese', color: 'text-destructive' }
}

export function NewEncounterPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const { session, healthStationId } = useAuth()
  const patient = mockPatients.find((p) => p.id === id)

  useSetPageMeta({
    title: 'New Visit',
    breadcrumbs: [
      { label: 'Patients', href: '/bhw/patients/search' },
      { label: patient ? `${patient.first_name} ${patient.last_name}` : 'Patient', href: `/bhw/patients/${id}` },
      { label: 'New Visit' },
    ],
  })

  // Form state
  const [consultationType, setConsultationType] = useState<ConsultationType>('New Consultation')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bpSystolic, setBpSystolic] = useState('')
  const [bpDiastolic, setBpDiastolic] = useState('')
  const [temperature, setTemperature] = useState('')
  const [programCategory, setProgramCategory] = useState<ProgramCategory | ''>('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)

  const weightNum = weight ? parseFloat(weight) : null
  const heightNum = height ? parseFloat(height) : null
  const bmi = useMemo(() => calculateBMI(weightNum, heightNum), [weightNum, heightNum])
  const bmiInfo = bmi ? bmiCategory(bmi) : null

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

  const handleSave = () => {
    const encId = `ENC-${String(mockEncounters.length + 1).padStart(4, '0')}`
    const encounter: Encounter = {
      id: encId,
      patient_id: id,
      consultation_type: consultationType,
      weight: weightNum,
      height: heightNum,
      bp_systolic: bpSystolic ? parseInt(bpSystolic) : null,
      bp_diastolic: bpDiastolic ? parseInt(bpDiastolic) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      bmi,
      program_category: (programCategory || 'General') as ProgramCategory,
      chief_complaint: chiefComplaint,
      clinical_notes: clinicalNotes,
      diagnosis,
      consent_given: consentGiven,
      status: 'PENDING_SYNC',
      date_time: new Date().toISOString(),
      provider_id: session?.user?.id ?? 'bhw-user-001',
      facility_code: healthStationId ?? 'KLD-BHS-01',
    }

    mockEncounters.push(encounter)
    navigate({ to: `/bhw/patients/${id}` })
  }

  return (
    <div className="space-y-6 pb-20">
      <Button variant="ghost" size="sm" className="-ml-1" onClick={() => navigate({ to: `/bhw/patients/${id}` })}>
        <ChevronLeft data-icon="inline-start" />
        Back to Patient
      </Button>

      <div>
        <h1 className="font-heading text-2xl font-semibold">New Visit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {patient.first_name} {patient.last_name} &middot; {patient.id}
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1 — Consultation Type */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Consultation Type</h2>
          </div>
          <Tabs
            value={consultationType}
            onValueChange={(v) => setConsultationType(v as ConsultationType)}
          >
            <TabsList variant="line">
              <TabsTrigger value="New Consultation">New Consultation</TabsTrigger>
              <TabsTrigger value="Follow-up">Follow-up</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Section 2 — Vitals */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Vitals</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>

          {bmi !== null && bmiInfo && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm">
                BMI: <span className="font-medium">{bmi}</span>
                {' \u2014 '}
                <span className={bmiInfo.color}>{bmiInfo.label}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Blood Pressure (mmHg)</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="120" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)} />
                <span className="text-muted-foreground">/</span>
                <Input type="number" placeholder="80" value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp">Temperature (&deg;C)</Label>
              <Input id="temp" type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 3 — Program Classification */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Program Classification</h2>
          </div>
          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="program">Program Category</Label>
            <Select value={programCategory} onValueChange={(v) => setProgramCategory(v as ProgramCategory)}>
              <SelectTrigger id="program" className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Maternal">Maternal</SelectItem>
                <SelectItem value="EPI">EPI</SelectItem>
                <SelectItem value="FP">FP</SelectItem>
                <SelectItem value="Nutrition">Nutrition</SelectItem>
                <SelectItem value="NCD">NCD</SelectItem>
                <SelectItem value="TB">TB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Section 4 — Clinical Notes */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Clinical Notes</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="complaint">Chief Complaint</Label>
            <Textarea id="complaint" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="e.g., Lagnat at ubo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea id="notes" value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Physical exam observations..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis / Impression</Label>
            <Textarea id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Initial assessment..." />
          </div>
        </div>

        {/* Section 5 — Consent */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Consent</h2>
          </div>
          <label className="flex items-start gap-3">
            <Checkbox checked={consentGiven} onCheckedChange={(v) => setConsentGiven(v === true)} className="mt-0.5" />
            <span className="text-sm leading-relaxed">
              I have obtained the patient&apos;s informed consent as required under the Data Privacy Act of 2012 (RA 10173).
            </span>
          </label>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Button type="button" disabled={!consentGiven} onClick={handleSave}>
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate({ to: `/bhw/patients/${id}` })}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

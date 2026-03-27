import { useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSetPageMeta } from '@/contexts/page-context'
import { mockPatients, nextPatientId } from '@/lib/mock-patients'
import type { Patient } from '@/types/patients'

export function PatientRegistrationPage() {
  useSetPageMeta({
    title: 'New Patient',
    breadcrumbs: [
      { label: 'Patients', href: '/bhw/patients/search' },
      { label: 'New Patient' },
    ],
  })

  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as Record<string, string>
  const prefillName = searchParams?.name ?? ''

  // Form state
  const [lastName, setLastName] = useState(prefillName)
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [suffix, setSuffix] = useState('')
  const [sex, setSex] = useState<'Male' | 'Female' | ''>('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [civilStatus, setCivilStatus] = useState<Patient['civil_status'] | ''>('')
  const [barangay, setBarangay] = useState('')
  const [purok, setPurok] = useState('')
  const [streetHouseNo, setStreetHouseNo] = useState('')
  const [philhealthId, setPhilhealthId] = useState('')
  const [isNhts, setIsNhts] = useState(false)
  const [is4ps, setIs4ps] = useState(false)
  const [isIp, setIsIp] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!lastName.trim()) { setError('Last Name is required.'); return }
    if (!firstName.trim()) { setError('First Name is required.'); return }
    if (!sex) { setError('Sex at Birth is required.'); return }
    if (!dateOfBirth) { setError('Date of Birth is required.'); return }
    if (!civilStatus) { setError('Civil Status is required.'); return }
    if (!barangay.trim()) { setError('Barangay is required.'); return }
    if (!purok.trim()) { setError('Purok / Sub-Zone is required.'); return }

    const id = nextPatientId()
    const newPatient: Patient = {
      id,
      philhealth_id: philhealthId.trim() || null,
      last_name: lastName.trim(),
      first_name: firstName.trim(),
      middle_name: middleName.trim() || null,
      suffix: suffix.trim() || null,
      sex,
      date_of_birth: dateOfBirth,
      civil_status: civilStatus,
      barangay: barangay.trim(),
      purok: purok.trim(),
      street_house_no: streetHouseNo.trim(),
      is_nhts: isNhts,
      is_4ps: is4ps,
      is_ip: isIp,
      created_at: new Date().toISOString(),
    }

    mockPatients.push(newPatient)
    navigate({ to: `/bhw/patients/${id}` })
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/bhw/patients/search" />} className="-ml-1">
        <ChevronLeft data-icon="inline-start" />
        Back to Patients
      </Button>

      <div>
        <h1 className="font-heading text-2xl font-semibold">Register New Patient</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in patient demographics and administrative info.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1 — Personal Information */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name <span className="text-destructive">*</span></Label>
              <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name <span className="text-destructive">*</span></Label>
              <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle-name">Middle Name</Label>
              <Input id="middle-name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="N/A if not applicable" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suffix">Suffix</Label>
              <Input id="suffix" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="Jr., Sr., III" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sex">Sex at Birth <span className="text-destructive">*</span></Label>
              <Select value={sex} onValueChange={(v) => setSex(v as 'Male' | 'Female')}>
                <SelectTrigger id="sex" className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth <span className="text-destructive">*</span></Label>
              <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="civil-status">Civil Status <span className="text-destructive">*</span></Label>
            <Select value={civilStatus} onValueChange={(v) => setCivilStatus(v as Patient['civil_status'])}>
              <SelectTrigger id="civil-status" className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Widow/er">Widow/er</SelectItem>
                <SelectItem value="Separated">Separated</SelectItem>
                <SelectItem value="Co-habiting">Co-habiting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Section 2 — Address */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Address</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="barangay">Barangay <span className="text-destructive">*</span></Label>
            <Input id="barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purok">Purok / Sub-Zone <span className="text-destructive">*</span></Label>
              <Input id="purok" value={purok} onChange={(e) => setPurok(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Street / House No.</Label>
              <Input id="street" value={streetHouseNo} onChange={(e) => setStreetHouseNo(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 3 — Administrative */}
        <div className="space-y-4">
          <div>
            <Separator />
            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">Administrative</h2>
          </div>
          <div className="space-y-2 sm:max-w-sm">
            <Label htmlFor="philhealth">PhilHealth ID</Label>
            <Input id="philhealth" value={philhealthId} onChange={(e) => setPhilhealthId(e.target.value)} placeholder="00-000000000-0 if Non-Member" />
          </div>
          <div className="space-y-3">
            <Label>Socio-Economic Classification</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Checkbox checked={isNhts} onCheckedChange={(v) => setIsNhts(v === true)} />
                <span className="text-sm">NHTS-PR</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={is4ps} onCheckedChange={(v) => setIs4ps(v === true)} />
                <span className="text-sm">4Ps Beneficiary</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={isIp} onCheckedChange={(v) => setIsIp(v === true)} />
                <span className="text-sm">Indigenous Person (IP)</span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive" role="alert">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit">Register Patient</Button>
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/bhw/patients/search' })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

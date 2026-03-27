import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserProfile, UserRole } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HealthStation {
  id: string
  name: string
}

interface UserFormProps {
  mode: 'create' | 'edit'
  userId?: string
}

// ---------------------------------------------------------------------------
// Role descriptions (derived from userflows.md)
// ---------------------------------------------------------------------------

const ROLE_DESCRIPTIONS: Record<UserRole, { label: string; description: string; access: string[] }> = {
  bhw: {
    label: 'Barangay Health Worker',
    description: 'Field-level health worker capturing patient visits in the barangay.',
    access: ['Patient registration & ITR', 'Visit records (maternal, immunization, NCD, TB, nutrition)', 'Offline data capture & sync'],
  },
  midwife_rhm: {
    label: 'Midwife / RHM',
    description: 'Manages TCL records and validates BHW submissions for their health station.',
    access: ['Validation queue', 'TCL registries', 'Summary Table generation', 'Inventory management'],
  },
  nurse_phn: {
    label: 'Public Health Nurse',
    description: 'Oversees monthly consolidation across all 32 BHS.',
    access: ['ST review and approval', 'MCT generation', 'Disease map and forecasting', 'City-wide patient view'],
  },
  phis_coordinator: {
    label: 'PHIS Coordinator',
    description: 'Manages data quality control and official FHSIS report exports.',
    access: ['DQC workflow', 'M1/M2 report exports', 'MCT queue management', 'Export history'],
  },
  dso: {
    label: 'Disease Surveillance Officer',
    description: 'Monitors real-time disease alerts and RA 11332 compliance.',
    access: ['Disease alerts (real-time)', 'PIDSR log', 'CIF workflow', 'Compliance metrics', 'Disease map'],
  },
  city_health_officer: {
    label: 'City Health Officer',
    description: 'Signs off on consolidated reports and monitors city-wide health intelligence.',
    access: ['Reports sign-off', 'Signed reports archive', 'Disease map & forecasting'],
  },
  system_admin: {
    label: 'System Administrator',
    description: 'Manages user accounts, BHS registry, and system configuration.',
    access: ['User management', 'BHS registry', 'Audit logs', 'Full system access'],
  },
}

const ROLE_OPTIONS: UserRole[] = [
  'system_admin',
  'city_health_officer',
  'phis_coordinator',
  'dso',
  'nurse_phn',
  'midwife_rhm',
  'bhw',
]

const STATION_REQUIRED_ROLES: UserRole[] = ['bhw', 'midwife_rhm']
const PUROK_ROLES: UserRole[] = ['bhw']

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserForm({ mode, userId }: UserFormProps) {
  const navigate = useNavigate()

  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [sex, setSex] = useState<'M' | 'F' | ''>('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [healthStationId, setHealthStationId] = useState('')
  const [purokAssignment, setPurokAssignment] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Data
  const [healthStations, setHealthStations] = useState<HealthStation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load health stations for the BHS select
  useEffect(() => {
    supabase
      .from('health_stations')
      .select('id, name')
      .order('name')
      .then(({ data }) => setHealthStations(data ?? []))
  }, [])

  // Prefill for edit mode
  useEffect(() => {
    if (mode !== 'edit' || !userId) return
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return
        const p = data as UserProfile
        setFullName(p.full_name)
        setUsername(p.username)
        setDateOfBirth(p.date_of_birth)
        setSex(p.sex)
        setMobileNumber(p.mobile_number ?? '')
        setRole(p.role)
        setHealthStationId(p.health_station_id ?? '')
        setPurokAssignment(p.purok_assignment ?? '')
      })
  }, [mode, userId])

  const selectedRoleInfo = role ? ROLE_DESCRIPTIONS[role] : null
  const needsStation = STATION_REQUIRED_ROLES.includes(role as UserRole)
  const needsPurok = PUROK_ROLES.includes(role as UserRole)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!role) {
      setError('Role is required.')
      return
    }

    if (!sex) {
      setError('Sex is required.')
      return
    }

    // Validate mobile number format if provided
    if (mobileNumber && !/^\+639\d{9}$/.test(mobileNumber)) {
      setError('Mobile number must be in the format +639XXXXXXXXX (e.g. +639171234567).')
      return
    }

    if (needsStation && !healthStationId) {
      setError('BHS Assignment is required for this role.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'create') {
        const { data: { session } } = await supabase.auth.getSession()
        const { data, error: fnError } = await supabase.functions.invoke('create-user', {
          body: {
            email,
            password,
            full_name: fullName,
            username,
            date_of_birth: dateOfBirth,
            sex,
            mobile_number: mobileNumber || null,
            role,
            health_station_id: healthStationId || null,
            purok_assignment: purokAssignment || null,
          },
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        })

        if (fnError || data?.error) {
          setError(fnError?.message ?? data?.error ?? 'Failed to create user.')
          return
        }
      } else {
        // Edit mode — update user_profiles directly
        const updates: Partial<UserProfile> = {
          full_name: fullName,
          username,
          date_of_birth: dateOfBirth,
          sex: sex as 'M' | 'F',
          mobile_number: mobileNumber || null,
          role: role as UserRole,
          health_station_id: healthStationId || null,
          purok_assignment: purokAssignment || null,
          updated_at: new Date().toISOString(),
        }

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', userId!)

        if (updateError) {
          setError(updateError.message)
          return
        }
      }

      navigate({ to: '/admin/users' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: form fields (spans 2 of 3 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Last, First, Middle"
                required
              />
            </div>

            {/* Email (create only) */}
            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@cho2.gov.ph"
                  required
                />
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. s.redona_kld"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            {/* Sex */}
            <div className="space-y-2">
              <Label htmlFor="sex">
                Sex <span className="text-destructive">*</span>
              </Label>
              <Select value={sex} onValueChange={(v) => setSex(v as 'M' | 'F')}>
                <SelectTrigger id="sex" className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+639171234567"
              />
              <p className="text-xs text-muted-foreground">Format: +639XXXXXXXXX</p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as UserRole)
                  setHealthStationId('')
                  setPurokAssignment('')
                }}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role…" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_DESCRIPTIONS[r].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BHS Assignment — only for bhw / midwife_rhm */}
            {needsStation && (
              <div className="space-y-2">
                <Label htmlFor="bhs">
                  BHS Assignment <span className="text-destructive">*</span>
                </Label>
                <Select value={healthStationId} onValueChange={(v) => setHealthStationId(v ?? '')}>
                  <SelectTrigger id="bhs" className="w-full">
                    <SelectValue placeholder="Select station…" />
                  </SelectTrigger>
                  <SelectContent>
                    {healthStations.map((hs) => (
                      <SelectItem key={hs.id} value={hs.id}>
                        {hs.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Purok Assignment — only for bhw */}
            {needsPurok && (
              <div className="space-y-2">
                <Label htmlFor="purok">Purok Assignment</Label>
                <Input
                  id="purok"
                  value={purokAssignment}
                  onChange={(e) => setPurokAssignment(e.target.value)}
                  placeholder="e.g. Purok 3"
                />
              </div>
            )}

            {/* Initial Password — create only */}
            {mode === 'create' && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="password">
                  Initial Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 12 characters"
                    minLength={12}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  User will be required to change this password on first login.
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive" role="alert">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading
                ? (mode === 'create' ? 'Creating…' : 'Saving…')
                : (mode === 'create' ? 'Create User' : 'Save Changes')}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin/users' })}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Right column: role summary card */}
        <div>
          {selectedRoleInfo ? (
            <Card className="sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{selectedRoleInfo.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{selectedRoleInfo.description}</p>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Access
                  </p>
                  <ul className="space-y-1">
                    {selectedRoleInfo.access.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Select a role to see access details.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  )
}

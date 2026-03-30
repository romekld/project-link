import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Map, MapControls } from '@/components/ui/map'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useSetPageMeta } from '@/contexts/page-context'
import { env } from '@/config/env'
import {
  commitCityBarangayImport,
  loadCityBarangayGeometryHistory,
  loadCityBarangayImportJob,
  loadCityBarangayRegistryRecords,
  validateCityBarangayImport,
} from '@/features/intelligence/api'
import {
  buildFeatureCollectionBounds,
  buildRegistryFeatureCollection,
} from '@/features/intelligence/management'
import type {
  CityBarangayGeometryVersion,
  CityBarangayImportItem,
  CityBarangayImportJob,
  CityBarangayRegistryRecord,
} from '@/features/intelligence/types'
import { IntelligenceDataTable } from './intelligence-data-table'
import { getCoveragePlannerMapStyles } from './coverage-planner/constants'
import { useCoveragePlannerMapProvider } from './coverage-planner/use-map-provider'
import { RegistryMapSurface } from './city-barangay-registry/registry-map-surface'
import { AlertTriangle, FileJson2, History, MapPinned, Upload } from 'lucide-react'

interface CityBarangayRegistryPageProps {
  roleScope: 'admin'
}

type RegistryTab = 'registry' | 'import-review'
type ImportInputTab = 'upload' | 'paste'

function formatTimestamp(value: string | null) {
  if (!value) return 'Not available'
  return new Date(value).toLocaleString()
}

function normalizeImportGeometry(item: CityBarangayImportItem | null) {
  const geometry = item?.source_payload?.geometry
  if (!geometry) return null
  if (typeof geometry === 'string') return JSON.parse(geometry)
  return geometry
}

export function CityBarangayRegistryPage({ roleScope }: CityBarangayRegistryPageProps) {
  const queryClient = useQueryClient()
  const { mapProvider, handleProviderChange } = useCoveragePlannerMapProvider()
  const [activeTab, setActiveTab] = useState<RegistryTab>('registry')
  const [importInputTab, setImportInputTab] = useState<ImportInputTab>('upload')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [selectedImportItemId, setSelectedImportItemId] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileText, setFileText] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [currentImportJobId, setCurrentImportJobId] = useState<string | null>(null)
  const [importDecisions, setImportDecisions] = useState<Record<string, 'create' | 'skip' | 'overwrite'>>({})
  const [confirmCommitOpen, setConfirmCommitOpen] = useState(false)

  useSetPageMeta({
    title: 'City Barangay Registry',
    breadcrumbs: [{ label: roleScope === 'admin' ? 'BHS Registry' : 'Intelligence' }, { label: 'City Barangay Registry' }],
  })

  const registryQuery = useQuery({
    queryKey: ['intelligence', 'city-barangays'],
    queryFn: loadCityBarangayRegistryRecords,
  })

  const effectiveSelectedCode = selectedCode ?? registryQuery.data?.[0]?.barangayCode ?? null

  const selectedRegistryRecord = useMemo(
    () => registryQuery.data?.find((record) => record.barangayCode === effectiveSelectedCode) ?? null,
    [effectiveSelectedCode, registryQuery.data],
  )

  const historyQuery = useQuery({
    queryKey: ['intelligence', 'city-barangays', 'history', selectedRegistryRecord?.barangayId],
    queryFn: () => loadCityBarangayGeometryHistory(selectedRegistryRecord!.barangayId),
    enabled: Boolean(selectedRegistryRecord?.barangayId),
  })

  const importJobQuery = useQuery({
    queryKey: ['intelligence', 'city-barangays', 'import-job', currentImportJobId],
    queryFn: () => loadCityBarangayImportJob(currentImportJobId!),
    enabled: Boolean(currentImportJobId),
  })

  const registryColumns = useMemo<ColumnDef<CityBarangayRegistryRecord>[]>(() => [
    {
      accessorKey: 'barangayName',
      header: 'Barangay',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="font-medium">{row.original.barangayName}</div>
          <div className="text-xs text-muted-foreground">{row.original.barangayCode}</div>
        </div>
      ),
    },
    { accessorKey: 'city', header: 'City' },
    {
      id: 'scope',
      header: 'Coverage',
      cell: ({ row }) => (
        <Badge variant={row.original.inCho2Scope ? 'default' : 'outline'}>
          {row.original.inCho2Scope ? 'In CHO2' : 'Outside CHO2'}
        </Badge>
      ),
    },
    {
      accessorKey: 'sourceAreaSqkm',
      header: 'Area sqkm',
      cell: ({ row }) => row.original.sourceAreaSqkm?.toFixed(3) ?? '—',
    },
  ], [])

  const registryFeatureCollection = useMemo(
    () => buildRegistryFeatureCollection(registryQuery.data ?? []),
    [registryQuery.data],
  )
  const registryBounds = useMemo(
    () => buildFeatureCollectionBounds(registryFeatureCollection),
    [registryFeatureCollection],
  )
  const mapStyles = useMemo(
    () => getCoveragePlannerMapStyles(mapProvider, env.maptilerApiKey),
    [mapProvider],
  )

  const resolvedImportItems = useMemo(
    () => (importJobQuery.data?.items ?? []).map((item) => ({
      ...item,
      resolvedAction: importDecisions[item.id] ?? (item.action === 'review_required' ? 'skip' : item.action),
    })),
    [importDecisions, importJobQuery.data?.items],
  )

  const selectedImportItem = useMemo(
    () => resolvedImportItems.find((item) => item.id === (selectedImportItemId ?? resolvedImportItems[0]?.id ?? null)) ?? null,
    [resolvedImportItems, selectedImportItemId],
  )

  const unresolvedImportItems = useMemo(
    () => resolvedImportItems.filter((item) => item.action === 'review_required' && !importDecisions[item.id]),
    [importDecisions, resolvedImportItems],
  )

  const hasOverwriteSelections = useMemo(
    () => resolvedImportItems.some((item) => item.resolvedAction === 'overwrite'),
    [resolvedImportItems],
  )

  const validateImportMutation = useMutation({
    mutationFn: async () => {
      const sourceText = importInputTab === 'upload' ? fileText : pasteText
      const sourceName = importInputTab === 'upload' ? fileName || 'upload.geojson' : 'pasted-geojson.geojson'
      if (!sourceText.trim()) {
        throw new Error(importInputTab === 'upload' ? 'Choose a GeoJSON file first.' : 'Paste a GeoJSON payload first.')
      }
      return validateCityBarangayImport(sourceName, sourceText)
    },
    onSuccess: (job) => {
      setActiveTab('import-review')
      setCurrentImportJobId((job as CityBarangayImportJob).id)
      setImportDecisions({})
      toast.success('GeoJSON validated. Review the rows before committing.')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to validate GeoJSON import.')
    },
  })

  const commitImportMutation = useMutation({
    mutationFn: async () => commitCityBarangayImport(
      currentImportJobId!,
      resolvedImportItems.map((item) => ({
        item_id: item.id,
        action: item.resolvedAction,
        selected_overwrite: item.resolvedAction === 'overwrite',
      })),
    ),
    onSuccess: async () => {
      toast.success('City barangay import committed successfully.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['intelligence', 'city-barangays'] }),
        queryClient.invalidateQueries({ queryKey: ['intelligence', 'coverage'] }),
        queryClient.invalidateQueries({ queryKey: ['intelligence', 'city-barangays', 'import-job', currentImportJobId] }),
      ])
      setConfirmCommitOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to commit GeoJSON import.')
    },
  })

  function handleFileChange(file: File | null) {
    if (!file) {
      setFileName('')
      setFileText('')
      return
    }

    setFileName(file.name)
    void file.text().then((text) => setFileText(text))
  }

  function handleOpenUploadFlow() {
    setActiveTab('import-review')
    setImportInputTab('upload')
  }

  function handleCommitImport() {
    if (unresolvedImportItems.length) {
      toast.error('Resolve all duplicate rows before committing the import.')
      return
    }

    if (hasOverwriteSelections) {
      setConfirmCommitOpen(true)
      return
    }

    void commitImportMutation.mutateAsync()
  }

  if (registryQuery.isLoading) {
    return (
      <Card className="border-primary/10">
        <CardContent className="py-10 text-center text-muted-foreground">
          Loading city barangay registry...
        </CardContent>
      </Card>
    )
  }

  if (registryQuery.isError || !registryQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Unable to load city barangay registry</AlertTitle>
        <AlertDescription>
          The registry data could not be loaded from the GIS backend.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold">City barangay registry</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the master city barangay boundaries and review GeoJSON imports before they affect coverage workflows.
            </p>
          </div>
          <Button onClick={handleOpenUploadFlow}>
            <Upload data-icon="inline-start" />
            Upload GeoJSON
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RegistryTab)}>
          <TabsList>
            <TabsTrigger value="registry">Registry</TabsTrigger>
            <TabsTrigger value="import-review">Import Review</TabsTrigger>
          </TabsList>

          <TabsContent value="registry" className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <Card className="overflow-hidden border-primary/10">
                <CardContent className="p-0">
                  <div className="relative h-[calc(100dvh-9rem)] min-h-[34rem] w-full bg-muted/30">
                    <Map
                      center={[120.9406, 14.3294]}
                      zoom={11}
                      maxZoom={16}
                      minZoom={9}
                      styles={mapStyles}
                      className="h-full"
                    >
                      <MapControls
                        position="bottom-right"
                        showZoom
                        showFullscreen
                        showProviderToggle
                        mapProvider={mapProvider}
                        onProviderChange={handleProviderChange}
                      />
                      <RegistryMapSurface
                        featureCollection={registryFeatureCollection}
                        initialBounds={registryBounds}
                        selectedCode={effectiveSelectedCode}
                        reviewGeometry={null}
                        onSelectCode={setSelectedCode}
                      />
                    </Map>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="size-4 text-muted-foreground" />
                    Registry inspector
                  </CardTitle>
                  <CardDescription>
                    Review source metadata and geometry change history for the selected city barangay.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRegistryRecord ? (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-xl border bg-muted/20 p-3">
                        <div className="text-sm font-semibold">{selectedRegistryRecord.barangayName}</div>
                        <div className="text-xs text-muted-foreground">{selectedRegistryRecord.barangayCode}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant={selectedRegistryRecord.inCho2Scope ? 'default' : 'outline'}>
                            {selectedRegistryRecord.inCho2Scope ? 'In CHO2' : 'Outside CHO2'}
                          </Badge>
                          <Badge variant="outline">{selectedRegistryRecord.city}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Source fid</div>
                          <div className="font-medium">{selectedRegistryRecord.sourceFid ?? '—'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Area sqkm</div>
                          <div className="font-medium">{selectedRegistryRecord.sourceAreaSqkm?.toFixed(3) ?? '—'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Valid on</div>
                          <div className="font-medium">{selectedRegistryRecord.sourceValidOn ?? '—'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Valid to</div>
                          <div className="font-medium">{selectedRegistryRecord.sourceValidTo ?? 'Open ended'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Created</div>
                          <div className="font-medium">{formatTimestamp(selectedRegistryRecord.createdAt)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Updated</div>
                          <div className="font-medium">{formatTimestamp(selectedRegistryRecord.updatedAt)}</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col gap-2">
                        <div>
                          <div className="text-sm font-medium">Geometry history</div>
                          <div className="text-xs text-muted-foreground">
                            Read-only history of uploads and overwrites stored by the backend.
                          </div>
                        </div>
                        <div className="max-h-72 overflow-auto rounded-xl border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Changed</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Reason</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {historyQuery.isLoading ? (
                                <TableRow>
                                  <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                                    Loading history...
                                  </TableCell>
                                </TableRow>
                              ) : historyQuery.data?.length ? (
                                historyQuery.data.map((entry: CityBarangayGeometryVersion) => (
                                  <TableRow key={entry.id}>
                                    <TableCell>{formatTimestamp(entry.changed_at)}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{entry.change_type}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-40 truncate">{entry.reason}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                                    No geometry history available yet.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Empty className="min-h-72 border bg-muted/20">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <MapPinned />
                        </EmptyMedia>
                        <EmptyTitle>Select a city barangay</EmptyTitle>
                        <EmptyDescription>
                          Click the map or table to inspect source metadata and geometry history.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>City barangay registry list</CardTitle>
                <CardDescription>
                  Browse all city barangays and keep the selected map polygon synchronized with the table.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntelligenceDataTable
                  columns={registryColumns}
                  data={registryQuery.data}
                  filterColumn="barangayName"
                  filterPlaceholder="Search city barangay"
                  onRowClick={(row) => setSelectedCode(row.barangayCode)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import-review" className="flex flex-col gap-4">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson2 className="size-4 text-muted-foreground" />
                  GeoJSON import
                </CardTitle>
                <CardDescription>
                  Upload a `.geojson` file or paste raw GeoJSON, validate it, then review duplicates before committing.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Tabs value={importInputTab} onValueChange={(value) => setImportInputTab(value as ImportInputTab)}>
                  <TabsList>
                    <TabsTrigger value="upload">Upload .geojson</TabsTrigger>
                    <TabsTrigger value="paste">Paste GeoJSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="pt-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="barangay-geojson-file">GeoJSON file</FieldLabel>
                        <Input
                          id="barangay-geojson-file"
                          type="file"
                          accept=".geojson,application/geo+json,application/json"
                          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                        />
                        <FieldDescription>
                          Choose a `.geojson` file containing a single Feature or a FeatureCollection.
                        </FieldDescription>
                      </Field>
                    </FieldGroup>
                  </TabsContent>

                  <TabsContent value="paste" className="pt-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="barangay-geojson-paste">GeoJSON payload</FieldLabel>
                        <Textarea
                          id="barangay-geojson-paste"
                          value={pasteText}
                          onChange={(event) => setPasteText(event.target.value)}
                          placeholder='{"type":"FeatureCollection","features":[...]}'
                          className="min-h-56 font-mono text-xs"
                        />
                        <FieldDescription>
                          Paste raw GeoJSON directly when you want to review the payload before uploading a file.
                        </FieldDescription>
                      </Field>
                    </FieldGroup>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    {importInputTab === 'upload'
                      ? (fileName ? `Selected file: ${fileName}` : 'No file selected yet.')
                      : (pasteText.trim() ? 'GeoJSON payload ready for validation.' : 'Paste a GeoJSON payload to continue.')}
                  </div>
                  <Button onClick={() => validateImportMutation.mutate()} disabled={validateImportMutation.isPending}>
                    {validateImportMutation.isPending ? 'Validating...' : 'Validate GeoJSON'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <Card className="overflow-hidden border-primary/10">
                <CardContent className="p-0">
                  <div className="relative h-[calc(100dvh-12rem)] min-h-[30rem] w-full bg-muted/30">
                    <Map
                      center={[120.9406, 14.3294]}
                      zoom={11}
                      maxZoom={16}
                      minZoom={9}
                      styles={mapStyles}
                      className="h-full"
                    >
                      <MapControls
                        position="bottom-right"
                        showZoom
                        showFullscreen
                        showProviderToggle
                        mapProvider={mapProvider}
                        onProviderChange={handleProviderChange}
                      />
                      <RegistryMapSurface
                        featureCollection={registryFeatureCollection}
                        initialBounds={registryBounds}
                        selectedCode={effectiveSelectedCode}
                        reviewGeometry={normalizeImportGeometry(selectedImportItem)}
                        onSelectCode={setSelectedCode}
                      />
                    </Map>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle>Import summary</CardTitle>
                  <CardDescription>
                    Review duplicates, choose overwrite or skip, then commit the validated batch.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {importJobQuery.data ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border bg-muted/20 p-3">
                          <div className="text-xs text-muted-foreground">Total features</div>
                          <div className="mt-2 font-heading text-2xl font-semibold">{importJobQuery.data.job.total_features}</div>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-3">
                          <div className="text-xs text-muted-foreground">Duplicates</div>
                          <div className="mt-2 font-heading text-2xl font-semibold">{importJobQuery.data.job.duplicate_features}</div>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-3">
                          <div className="text-xs text-muted-foreground">Valid</div>
                          <div className="mt-2 font-heading text-2xl font-semibold">{importJobQuery.data.job.valid_features}</div>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-3">
                          <div className="text-xs text-muted-foreground">Errors</div>
                          <div className="mt-2 font-heading text-2xl font-semibold">{importJobQuery.data.job.error_features}</div>
                        </div>
                      </div>

                      <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                        {selectedImportItem
                          ? `${selectedImportItem.name ?? 'Unnamed feature'} (${selectedImportItem.pcode ?? 'No PSGC'}) is highlighted on the map.`
                          : 'Select a review row to highlight its geometry on the map.'}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button onClick={handleCommitImport} disabled={!importJobQuery.data.items.length || commitImportMutation.isPending}>
                          {commitImportMutation.isPending ? 'Committing...' : 'Commit import'}
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          {unresolvedImportItems.length
                            ? `${unresolvedImportItems.length} duplicate row${unresolvedImportItems.length === 1 ? '' : 's'} still need a decision.`
                            : 'All duplicate rows have been resolved.'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Empty className="min-h-72 border bg-muted/20">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Upload />
                        </EmptyMedia>
                        <EmptyTitle>No validated import yet</EmptyTitle>
                        <EmptyDescription>
                          Validate an upload or pasted payload to populate the review table and import summary.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Import review table</CardTitle>
                <CardDescription>
                  Duplicate PSGC rows default to blocked review. Set each duplicate to overwrite or skip before commit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importJobQuery.data ? (
                  <div className="overflow-hidden rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>PSGC</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Decision</TableHead>
                          <TableHead>Overwrite</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resolvedImportItems.map((item) => {
                          const isSelected = item.id === selectedImportItemId
                          const hasErrors = item.validation_errors.length > 0

                          return (
                            <TableRow
                              key={item.id}
                              data-state={isSelected ? 'selected' : undefined}
                              className="cursor-pointer"
                              onClick={() => setSelectedImportItemId(item.id)}
                            >
                              <TableCell>{item.feature_index}</TableCell>
                              <TableCell>{item.pcode ?? '—'}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="font-medium">{item.name ?? 'Unnamed feature'}</div>
                                  {item.existing_city_barangay_id ? (
                                    <div className="text-xs text-muted-foreground">Existing registry match detected</div>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                {hasErrors ? (
                                  <Badge variant="destructive">Invalid</Badge>
                                ) : item.action === 'review_required' ? (
                                  <Badge variant="secondary">Review required</Badge>
                                ) : (
                                  <Badge variant="outline">{item.action}</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {item.action === 'review_required' ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={item.resolvedAction === 'skip' ? 'default' : 'outline'}
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        setImportDecisions((current) => ({ ...current, [item.id]: 'skip' }))
                                      }}
                                    >
                                      Skip
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={item.resolvedAction === 'overwrite' ? 'default' : 'outline'}
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        setImportDecisions((current) => ({ ...current, [item.id]: 'overwrite' }))
                                      }}
                                    >
                                      Overwrite
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant={item.resolvedAction === 'create' ? 'default' : 'outline'}>
                                    {item.resolvedAction}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Field orientation="horizontal" className="items-center gap-3">
                                  <Switch
                                    checked={item.resolvedAction === 'overwrite'}
                                    disabled={item.action !== 'review_required'}
                                    onClick={(event) => event.stopPropagation()}
                                    onCheckedChange={(checked) => {
                                      setImportDecisions((current) => ({
                                        ...current,
                                        [item.id]: checked ? 'overwrite' : 'skip',
                                      }))
                                    }}
                                  />
                                  <FieldLabel className="text-xs">
                                    {item.action === 'review_required' ? 'Allow overwrite' : 'N/A'}
                                  </FieldLabel>
                                </Field>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Empty className="border bg-muted/20">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileJson2 />
                      </EmptyMedia>
                      <EmptyTitle>Nothing to review yet</EmptyTitle>
                      <EmptyDescription>
                        Validate a GeoJSON file or pasted payload to inspect duplicate handling before commit.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={confirmCommitOpen} onOpenChange={setConfirmCommitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Commit GeoJSON import with overwrites?</AlertDialogTitle>
            <AlertDialogDescription>
              One or more duplicate PSGC rows are marked for overwrite. Confirm to replace the existing stored geometry for those rows.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={commitImportMutation.isPending}>Review again</AlertDialogCancel>
            <AlertDialogAction onClick={() => void commitImportMutation.mutateAsync()} disabled={commitImportMutation.isPending}>
              {commitImportMutation.isPending ? 'Committing...' : 'Confirm commit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

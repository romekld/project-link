"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import type { CityBarangayRegistryRecord } from "../../../city-barangay-registry/data/schema";
import {
  addStationSchema,
  editStationSchema,
  getCityBarangayLabel,
  toCityBarangayOptions,
  type AddStationValues,
  type OperationalBarangayOption,
} from "../../data/form-schema";
import type { ManagementRouteContext } from "../../data/route-context";
import { createStationAction, updateStationAction } from "../../actions";
import { StationFormMainPanel } from "./station-form-main-panel";
import { StationFormRightPanel } from "./station-form-right-panel";
import { StationPinEditorDialog } from "../../../pin-map/components/station-pin-editor-dialog";
import { getGeometryCentroid } from "../../../pin-map/data";

type StationFormMode = "create" | "edit";

type StationFormProps = {
  mode: StationFormMode;
  stationId?: string;
  defaultValues?: Partial<AddStationValues>;
  registryRecords: CityBarangayRegistryRecord[];
  operationalBarangays: OperationalBarangayOption[];
  routeContext: ManagementRouteContext;
  activity?: {
    createdAt?: string;
    updatedAt?: string;
    deactivatedAt?: string | null;
  };
};

export function StationForm({
  mode,
  stationId,
  defaultValues,
  registryRecords,
  operationalBarangays,
  routeContext,
  activity,
}: StationFormProps) {
  const router = useRouter();
  const [isPhysicalBarangayOpen, setIsPhysicalBarangayOpen] = useState(false);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<AddStationValues | null>(
    null,
  );
  const [isPinEditorOpen, setIsPinEditorOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const physicalBarangayOptions = useMemo(
    () => toCityBarangayOptions(registryRecords),
    [registryRecords],
  );

  const form = useForm<AddStationValues>({
    resolver: zodResolver(
      mode === "create" ? addStationSchema : editStationSchema,
    ) as never,
    defaultValues,
  });

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const values = useWatch({
    control,
  }) as Partial<AddStationValues>;

  const selectedPhysicalBarangayLabel = useMemo(() => {
    if (!values.physicalCityBarangayId) return "";

    return getCityBarangayLabel(
      values.physicalCityBarangayId,
      physicalBarangayOptions,
    );
  }, [physicalBarangayOptions, values.physicalCityBarangayId]);

  const selectedPhysicalBarangayRecord = useMemo(() => {
    return (
      registryRecords.find(
        (record) => record.id === values.physicalCityBarangayId,
      ) ?? null
    );
  }, [registryRecords, values.physicalCityBarangayId]);

  const coordinatesLabel = useMemo(() => {
    if (
      typeof values.latitude === "number" &&
      typeof values.longitude === "number"
    ) {
      return `${values.latitude.toFixed(6)}, ${values.longitude.toFixed(6)}`;
    }

    const centroid = selectedPhysicalBarangayRecord
      ? getGeometryCentroid(selectedPhysicalBarangayRecord.geometry)
      : null;

    if (centroid) {
      return `${centroid.lat.toFixed(6)}, ${centroid.lng.toFixed(6)} (centroid)`;
    }

    return "Not set";
  }, [selectedPhysicalBarangayRecord, values.latitude, values.longitude]);

  const pinSourceLabel = useMemo(() => {
    if (
      typeof values.latitude === "number" &&
      typeof values.longitude === "number"
    ) {
      return "Saved pin";
    }

    if (selectedPhysicalBarangayRecord) {
      return "Barangay centroid";
    }

    return "City fallback";
  }, [selectedPhysicalBarangayRecord, values.latitude, values.longitude]);

  const conflictingRows = (values.coverageRows ?? []).filter(
    (row) => row.isActive && row.isPrimary && row.currentPrimaryStationName,
  );
  const hasPrimaryConflicts = conflictingRows.length > 0;

  function handleCoverageActiveChange(index: number, active: boolean) {
    setValue(`coverageRows.${index}.isActive`, active, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!active) {
      setValue(`coverageRows.${index}.isPrimary`, false, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function handleCoveragePrimaryChange(index: number, primary: boolean) {
    setValue(`coverageRows.${index}.isPrimary`, primary, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (primary) {
      setValue(`coverageRows.${index}.isActive`, true, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function submitPayload(payload: AddStationValues) {
    setSubmitError(null);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createStationAction(payload, routeContext.basePath)
          : await updateStationAction(
              stationId!,
              payload as Parameters<typeof updateStationAction>[1],
              routeContext.basePath,
            );

      if ("error" in result) {
        setSubmitError(result.error);
      } else {
        router.push(routeContext.basePath);
      }
    });
  }

  function handleFormSubmit(payload: AddStationValues) {
    const conflicts = payload.coverageRows.filter(
      (row) => row.isActive && row.isPrimary && row.currentPrimaryStationName,
    );

    if (conflicts.length > 0) {
      setPendingValues(payload);
      setIsConflictDialogOpen(true);
      return;
    }

    submitPayload(payload);
  }

  function handleConfirmConflictSave() {
    if (!pendingValues) return;

    submitPayload(pendingValues);
    setPendingValues(null);
    setIsConflictDialogOpen(false);
  }

  function handleApplyPin(coordinates: { lat: number; lng: number }) {
    setValue("latitude", coordinates.lat, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("longitude", coordinates.lng, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("pinStatus", "pinned", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <section className="mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-1 flex-col overflow-hidden">
          <div className="shrink-0 bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:pb-6">
            <PageHeader
              title={
                mode === "create" ? "Add Health Station" : "Edit Health Station"
              }
              description={
                mode === "create"
                  ? "Register a new facility with physical location and service coverage assignments."
                  : "Update station identity, assignment scope, and status controls."
              }
              controls={
                <>
                  <Button asChild className="h-10 px-4" variant="outline">
                    <Link href={routeContext.basePath}>Cancel</Link>
                  </Button>
                  <Button
                    className="h-10 px-4"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {mode === "create" ? "Save station" : "Update station"}
                  </Button>
                </>
              }
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 px-1 py-2 sm:gap-5 sm:pr-2">
              <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <StationFormMainPanel
                  control={control}
                  errors={errors}
                  register={register}
                  values={values}
                  isPhysicalBarangayOpen={isPhysicalBarangayOpen}
                  setIsPhysicalBarangayOpen={setIsPhysicalBarangayOpen}
                  physicalBarangayOptions={physicalBarangayOptions}
                  operationalBarangays={operationalBarangays}
                  selectedPhysicalBarangayLabel={selectedPhysicalBarangayLabel}
                  hasPrimaryConflicts={hasPrimaryConflicts}
                  onCoverageActiveChange={handleCoverageActiveChange}
                  onCoveragePrimaryChange={handleCoveragePrimaryChange}
                  submitError={submitError}
                />

                <StationFormRightPanel
                  values={values}
                  mode={mode}
                  coordinatesLabel={coordinatesLabel}
                  physicalBarangayOptions={physicalBarangayOptions}
                  pinSourceLabel={pinSourceLabel}
                  onOpenPinEditor={() => setIsPinEditorOpen(true)}
                  activity={activity}
                />
              </section>
            </div>
          </div>
        </section>
      </form>

      <AlertDialog
        open={isConflictDialogOpen}
        onOpenChange={(open) => {
          setIsConflictDialogOpen(open);
          if (!open) {
            setPendingValues(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm primary reassignment</AlertDialogTitle>
            <AlertDialogDescription>
              {conflictingRows.length} barangay assignment
              {conflictingRows.length > 1 ? "s" : ""} will demote another
              station&apos;s active primary assignment. Continue only if this
              change is intentional.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmConflictSave}>
              Confirm and save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StationPinEditorDialog
        currentLatitude={values.latitude ?? null}
        currentLongitude={values.longitude ?? null}
        open={isPinEditorOpen}
        onApply={handleApplyPin}
        onOpenChange={setIsPinEditorOpen}
        physicalBarangayName={selectedPhysicalBarangayRecord?.name ?? "Not set"}
        physicalBarangayPcode={selectedPhysicalBarangayRecord?.pcode ?? ""}
        registryRecords={registryRecords}
        stationCode={values.stationCode || "Not set"}
        stationName={values.name || "Untitled station"}
      />
    </>
  );
}

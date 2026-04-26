"use client"

import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { householdInfoSchema, type HouseholdInfoValues } from "../data/form-schema"

type StepHouseholdInfoProps = {
  formId: string
  defaultValues?: Partial<HouseholdInfoValues>
  quarterLabel: string
  onNext: (values: HouseholdInfoValues) => void
}

export function StepHouseholdInfo({
  formId,
  defaultValues,
  quarterLabel,
  onNext,
}: StepHouseholdInfoProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HouseholdInfoValues>({
    resolver: zodResolver(householdInfoSchema),
    defaultValues: {
      nhtsStatus: "Non-NHTS",
      isIndigenousPeople: false,
      hhHeadPhilhealthMember: false,
      ...defaultValues,
    },
  })

  const philhealthMember = useWatch({
    control,
    name: "hhHeadPhilhealthMember",
  })

  return (
    <form id={formId} onSubmit={handleSubmit(onNext)} className="flex flex-col gap-4">
      <Card>
        <CardHeader className="border-b pb-3 pt-4">
          <CardTitle className="text-base">Visit Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <FieldGroup>
            <Field data-invalid={!!errors.visitDate}>
              <FieldLabel htmlFor="visitDate">Date of Visit — {quarterLabel}</FieldLabel>
              <Controller
                name="visitDate"
                control={control}
                render={({ field }) => (
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="visitDate"
                        type="button"
                        variant="outline"
                        className="w-full justify-between font-normal"
                        aria-invalid={!!errors.visitDate}
                      >
                        {field.value
                          ? format(new Date(field.value), "MMMM d, yyyy")
                          : "Select visit date"}
                        <CalendarIcon data-icon="inline-end" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (!date) return
                          field.onChange(format(date, "yyyy-MM-dd"))
                          setDatePickerOpen(false)
                        }}
                        disabled={{ after: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError errors={[errors.visitDate]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-3 pt-4">
          <CardTitle className="text-base">Respondent</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.respondentLastName}>
                <FieldLabel htmlFor="respondentLastName">Last name</FieldLabel>
                <Input
                  id="respondentLastName"
                  placeholder="Dela Cruz"
                  aria-invalid={!!errors.respondentLastName}
                  {...register("respondentLastName")}
                />
                <FieldError errors={[errors.respondentLastName]} />
              </Field>

              <Field data-invalid={!!errors.respondentFirstName}>
                <FieldLabel htmlFor="respondentFirstName">First name</FieldLabel>
                <Input
                  id="respondentFirstName"
                  placeholder="Juan"
                  aria-invalid={!!errors.respondentFirstName}
                  {...register("respondentFirstName")}
                />
                <FieldError errors={[errors.respondentFirstName]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="respondentMiddleName">Middle name</FieldLabel>
              <Input
                id="respondentMiddleName"
                placeholder="Optional"
                {...register("respondentMiddleName")}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-3 pt-4">
          <CardTitle className="text-base">Household Profile</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <FieldGroup>
            <Field data-invalid={!!errors.nhtsStatus}>
              <FieldLabel htmlFor="nhtsStatus">NHTS Household</FieldLabel>
              <Controller
                name="nhtsStatus"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="nhtsStatus" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="NHTS-4Ps">NHTS-4Ps</SelectItem>
                        <SelectItem value="Non-NHTS">Non-NHTS</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>Is this household a 4Ps beneficiary?</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="isIndigenousPeople">Indigenous People (IP) Household</FieldLabel>
              <Controller
                name="isIndigenousPeople"
                control={control}
                render={({ field }) => (
                  <div className="flex h-10 items-center gap-3 rounded-lg px-1">
                    <Switch
                      id="isIndigenousPeople"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value ? "Yes, IP household" : "Not an IP household"}
                    </span>
                  </div>
                )}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-3 pt-4">
          <CardTitle className="text-base">PhilHealth — HH Head</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="hhHeadPhilhealthMember">HH Head is a PhilHealth member</FieldLabel>
              <Controller
                name="hhHeadPhilhealthMember"
                control={control}
                render={({ field }) => (
                  <div className="flex h-10 items-center gap-3 rounded-lg px-1">
                    <Switch
                      id="hhHeadPhilhealthMember"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value ? "Yes, PhilHealth member" : "No PhilHealth membership"}
                    </span>
                  </div>
                )}
              />
            </Field>

            {philhealthMember && (
              <>
                <Field>
                  <FieldLabel htmlFor="hhHeadPhilhealthId">PhilHealth ID No.</FieldLabel>
                  <Input
                    id="hhHeadPhilhealthId"
                    placeholder="XX-XXXXXXXXX-X"
                    {...register("hhHeadPhilhealthId")}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="hhHeadPhilhealthCategory">PhilHealth Category</FieldLabel>
                  <Controller
                    name="hhHeadPhilhealthCategory"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <SelectTrigger id="hhHeadPhilhealthCategory" className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {[
                              "Formal Economy",
                              "Informal Economy",
                              "Indigent/Sponsored",
                              "Senior Citizen",
                              "Other",
                            ].map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </>
            )}
          </FieldGroup>
        </CardContent>
      </Card>

    </form>
  )
}

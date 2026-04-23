"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { memberSchema, type MemberValues } from "../data/form-schema"
import {
  classificationOptions,
  autoSuggestClassification,
  computeAge,
} from "../data/classification"

type MemberSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<MemberValues>
  onSave: (values: MemberValues) => void
  isFirstMember?: boolean
}

export function MemberSheet({
  open,
  onOpenChange,
  defaultValues,
  onSave,
  isFirstMember,
}: MemberSheetProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemberValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      id: crypto.randomUUID(),
      sex: "M",
      dobEstimated: false,
      relationshipToHhHead: isFirstMember ? "1-Head" : undefined,
      ...defaultValues,
    },
  })

  const dateOfBirth = watch("dateOfBirth")
  const sex = watch("sex")
  const classificationQ1 = watch("classificationQ1")

  const computedAge = dateOfBirth ? computeAge(dateOfBirth) : null
  const showPhilhealthId = computedAge !== null && computedAge >= 21

  useEffect(() => {
    if (dateOfBirth && sex) {
      const suggested = autoSuggestClassification(dateOfBirth, sex as "M" | "F")
      if (suggested && !classificationQ1) {
        setValue("classificationQ1", suggested)
      }
    }
  }, [dateOfBirth, sex, classificationQ1, setValue])

  function onSubmit(values: MemberValues) {
    onSave(values)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[92dvh] flex-col rounded-t-xl px-0"
      >
        <SheetHeader className="border-b px-4 pb-3">
          <SheetTitle>
            {defaultValues?.memberLastName ? "Edit Member" : "Add Member"}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-0 overflow-y-auto"
        >
          <div className="flex flex-col gap-4 px-4 py-4">
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.memberLastName}>
                  <FieldLabel htmlFor="memberLastName">Last name</FieldLabel>
                  <Input
                    id="memberLastName"
                    placeholder="Dela Cruz"
                    aria-invalid={!!errors.memberLastName}
                    {...register("memberLastName")}
                  />
                  <FieldError errors={[errors.memberLastName]} />
                </Field>

                <Field data-invalid={!!errors.memberFirstName}>
                  <FieldLabel htmlFor="memberFirstName">First name</FieldLabel>
                  <Input
                    id="memberFirstName"
                    placeholder="Juan"
                    aria-invalid={!!errors.memberFirstName}
                    {...register("memberFirstName")}
                  />
                  <FieldError errors={[errors.memberFirstName]} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="memberMiddleName">Middle name</FieldLabel>
                <Input id="memberMiddleName" placeholder="Optional" {...register("memberMiddleName")} />
              </Field>

              <Field>
                <FieldLabel htmlFor="memberMothersMaidenName">Mother&apos;s maiden name</FieldLabel>
                <Input
                  id="memberMothersMaidenName"
                  placeholder="Optional"
                  {...register("memberMothersMaidenName")}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field data-invalid={!!errors.relationshipToHhHead}>
                <FieldLabel htmlFor="relationshipToHhHead">Relationship to HH Head</FieldLabel>
                <Controller
                  name="relationshipToHhHead"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger id="relationshipToHhHead" className="w-full">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {[
                            { value: "1-Head", label: "Head" },
                            { value: "2-Spouse", label: "Spouse" },
                            { value: "3-Son", label: "Son" },
                            { value: "4-Daughter", label: "Daughter" },
                            { value: "5-Others", label: "Others" },
                          ].map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.relationshipToHhHead]} />
              </Field>

              <Field data-invalid={!!errors.sex}>
                <FieldLabel>Sex</FieldLabel>
                <Controller
                  name="sex"
                  control={control}
                  render={({ field }) => (
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(v) => v && field.onChange(v)}
                      className="grid grid-cols-2 gap-2"
                    >
                      <ToggleGroupItem
                        value="M"
                        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        Male
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="F"
                        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        Female
                      </ToggleGroupItem>
                    </ToggleGroup>
                  )}
                />
                <FieldError errors={[errors.sex]} />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field data-invalid={!!errors.dateOfBirth}>
                <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="dateOfBirth"
                          type="button"
                          variant="outline"
                          className="w-full justify-between font-normal"
                          aria-invalid={!!errors.dateOfBirth}
                        >
                          {field.value ? (
                            <span>
                              {format(new Date(field.value), "MMMM d, yyyy")}
                              {computedAge !== null && (
                                <span className="ml-2 text-muted-foreground">
                                  ({computedAge} yrs)
                                </span>
                              )}
                            </span>
                          ) : (
                            "Select date of birth"
                          )}
                          <CalendarIcon data-icon="inline-end" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          startMonth={new Date(1920, 0, 1)}
                          endMonth={new Date()}
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
                <FieldError errors={[errors.dateOfBirth]} />
              </Field>

              <Field>
                <Controller
                  name="dobEstimated"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="dobEstimated"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="size-5"
                      />
                      <FieldLabel htmlFor="dobEstimated" className="cursor-pointer font-normal">
                        Date of birth is estimated
                      </FieldLabel>
                    </div>
                  )}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field data-invalid={!!errors.classificationQ1}>
                <FieldLabel htmlFor="classificationQ1">
                  Classification Q1
                  {dateOfBirth && (
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      auto-suggested
                    </Badge>
                  )}
                </FieldLabel>
                <Controller
                  name="classificationQ1"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <SelectTrigger id="classificationQ1" className="w-full">
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {classificationOptions.map((opt) => (
                            <SelectItem key={opt.code} value={opt.code}>
                              <span className="font-medium">{opt.code}</span>
                              <span className="ml-1.5 text-muted-foreground">
                                — {opt.description}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>
                  Based on date of birth. Change if needed (e.g. unregistered pregnancy).
                </FieldDescription>
              </Field>

              {showPhilhealthId && (
                <Field>
                  <FieldLabel htmlFor="memberPhilhealthId">
                    PhilHealth ID No.
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      Age ≥ 21
                    </Badge>
                  </FieldLabel>
                  <Input
                    id="memberPhilhealthId"
                    placeholder="XX-XXXXXXXXX-X"
                    {...register("memberPhilhealthId")}
                  />
                  <FieldDescription>
                    Enter if enrolled. Leave blank if not a PhilHealth member.
                  </FieldDescription>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="memberRemarks">Remarks</FieldLabel>
                <Textarea
                  id="memberRemarks"
                  placeholder="Optional — transferred household, new resident, etc."
                  rows={2}
                  {...register("memberRemarks")}
                />
              </Field>
            </FieldGroup>
          </div>

          <div className="border-t px-4 pb-6 pt-3">
            <Button type="submit" size="lg" className="w-full">
              Save Member
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

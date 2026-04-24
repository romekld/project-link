"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import type { HouseholdInfoValues, MemberValues } from "../data/form-schema"
import { computeAge } from "../data/classification"

const relationshipLabels: Record<string, string> = {
  "1-Head": "Head",
  "2-Spouse": "Spouse",
  "3-Son": "Son",
  "4-Daughter": "Daughter",
  "5-Others": "Others",
}

type StepReviewProps = {
  householdInfo: HouseholdInfoValues
  members: MemberValues[]
  quarterLabel: string
}

export function StepReview({
  householdInfo,
  members,
  quarterLabel,
}: StepReviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="border-b pb-3 pt-4">
          <CardTitle className="text-base">Household Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <dl className="grid gap-2 text-sm">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-muted-foreground">Visit ({quarterLabel})</dt>
              <dd>
                {householdInfo.visitDate
                  ? format(new Date(householdInfo.visitDate), "MMMM d, yyyy")
                  : "—"}
              </dd>
            </div>
            <Separator />
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-muted-foreground">Respondent</dt>
              <dd>
                {householdInfo.respondentLastName}, {householdInfo.respondentFirstName}
                {householdInfo.respondentMiddleName
                  ? ` ${householdInfo.respondentMiddleName}`
                  : ""}
              </dd>
            </div>
            <Separator />
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-muted-foreground">NHTS Status</dt>
              <dd>
                <Badge variant={householdInfo.nhtsStatus === "NHTS-4Ps" ? "default" : "outline"}>
                  {householdInfo.nhtsStatus}
                </Badge>
              </dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-muted-foreground">IP Household</dt>
              <dd>{householdInfo.isIndigenousPeople ? "Yes" : "No"}</dd>
            </div>
            <Separator />
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-muted-foreground">PhilHealth (HH)</dt>
              <dd>
                {householdInfo.hhHeadPhilhealthMember ? (
                  <span>
                    Yes
                    {householdInfo.hhHeadPhilhealthId && (
                      <span className="ml-1 text-muted-foreground">
                        · {householdInfo.hhHeadPhilhealthId}
                      </span>
                    )}
                    {householdInfo.hhHeadPhilhealthCategory && (
                      <span className="ml-1 text-muted-foreground">
                        · {householdInfo.hhHeadPhilhealthCategory}
                      </span>
                    )}
                  </span>
                ) : (
                  "No"
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-3 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Members</CardTitle>
            <Badge variant="secondary">{members.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3">
            {members.map((member, index) => {
              const age = member.dateOfBirth ? computeAge(member.dateOfBirth) : null
              const rel = relationshipLabels[member.relationshipToHhHead] ?? member.relationshipToHhHead
              return (
                <div key={member.id}>
                  {index > 0 && <Separator className="mb-3" />}
                  <dl className="grid gap-1.5 text-sm">
                    <div className="grid grid-cols-[88px_1fr] gap-2">
                      <dt className="font-medium text-foreground">
                        {index + 1}. {member.memberLastName}, {member.memberFirstName}
                      </dt>
                      <dd />
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2">
                      <dt className="text-muted-foreground">Relationship</dt>
                      <dd>{rel}</dd>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2">
                      <dt className="text-muted-foreground">Sex</dt>
                      <dd>{member.sex === "M" ? "Male" : "Female"}</dd>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2">
                      <dt className="text-muted-foreground">Birthday</dt>
                      <dd>
                        {member.dateOfBirth
                          ? format(new Date(member.dateOfBirth), "MMM d, yyyy")
                          : "—"}
                        {age !== null && (
                          <span className="ml-1 text-muted-foreground">
                            ({age} yrs{member.dobEstimated ? ", est." : ""})
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="grid grid-cols-[88px_1fr] gap-2">
                      <dt className="text-muted-foreground">Class. Q1</dt>
                      <dd>
                        {member.classificationQ1 ? (
                          <Badge variant="secondary">{member.classificationQ1}</Badge>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                    {member.memberPhilhealthId && (
                      <div className="grid grid-cols-[88px_1fr] gap-2">
                        <dt className="text-muted-foreground">PhilHealth</dt>
                        <dd>{member.memberPhilhealthId}</dd>
                      </div>
                    )}
                    {member.memberRemarks && (
                      <div className="grid grid-cols-[88px_1fr] gap-2">
                        <dt className="text-muted-foreground">Remarks</dt>
                        <dd className="text-xs">{member.memberRemarks}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        This record will be saved locally and submitted to the Midwife for review when you are online.
      </p>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MemberSheet } from "./member-sheet"
import type { MemberValues } from "../data/form-schema"
import { computeAge } from "../data/classification"

const relationshipLabels: Record<string, string> = {
  "1-Head": "Head",
  "2-Spouse": "Spouse",
  "3-Son": "Son",
  "4-Daughter": "Daughter",
  "5-Others": "Others",
}

type StepMemberRosterProps = {
  members: MemberValues[]
  onMembersChange: (members: MemberValues[]) => void
  onNext: () => void
  onBack: () => void
}

export function StepMemberRoster({
  members,
  onMembersChange,
  onNext,
  onBack,
}: StepMemberRosterProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<MemberValues | undefined>()

  function handleSaveMember(values: MemberValues) {
    const exists = members.find((m) => m.id === values.id)
    if (exists) {
      onMembersChange(members.map((m) => (m.id === values.id ? values : m)))
    } else {
      onMembersChange([...members, values])
    }
  }

  function handleEditMember(member: MemberValues) {
    setEditingMember(member)
    setSheetOpen(true)
  }

  function handleDeleteMember(id: string) {
    onMembersChange(members.filter((m) => m.id !== id))
  }

  function handleAddMember() {
    setEditingMember(undefined)
    setSheetOpen(true)
  }

  const hasHead = members.some((m) => m.relationshipToHhHead === "1-Head")

  return (
    <div className="flex flex-col gap-4">
      {!hasHead && members.length === 0 && (
        <Alert>
          <Users className="size-4" />
          <AlertDescription>
            Start by adding the <strong>household head</strong>. Then add the spouse, children (eldest to youngest), and other members.
          </AlertDescription>
        </Alert>
      )}

      {members.length > 0 && (
        <div className="flex flex-col gap-2">
          {members.map((member, index) => {
            const age = member.dateOfBirth ? computeAge(member.dateOfBirth) : null
            const rel = relationshipLabels[member.relationshipToHhHead] ?? member.relationshipToHhHead
            return (
              <article
                key={member.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">
                    {member.memberLastName}, {member.memberFirstName}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{rel}</span>
                    <span>·</span>
                    <span>{member.sex === "M" ? "Male" : "Female"}</span>
                    {age !== null && (
                      <>
                        <span>·</span>
                        <span>{age} yrs{member.dobEstimated ? " (est.)" : ""}</span>
                      </>
                    )}
                    {member.classificationQ1 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {member.classificationQ1}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    onClick={() => handleEditMember(member)}
                    aria-label={`Edit ${member.memberFirstName}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteMember(member.id)}
                    aria-label={`Remove ${member.memberFirstName}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 border-dashed"
        onClick={handleAddMember}
      >
        <Plus className="size-4" />
        Add{members.length === 0 ? " Household Head" : " Member"}
      </Button>

      <MemberSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        defaultValues={editingMember}
        onSave={handleSaveMember}
        isFirstMember={members.length === 0}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={onNext}
          disabled={members.length === 0}
        >
          Review
        </Button>
      </div>
    </div>
  )
}

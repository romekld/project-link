"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { HouseholdsList } from "./components/households-list"
import type { Household } from "./data/schema"

type BhwHouseholdsPageProps = {
  households: Household[]
}

export function BhwHouseholdsPage({ households }: BhwHouseholdsPageProps) {
  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Households"
        description={`${households.length} assigned to you`}
        controls={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/bhw/households/new">
              <Plus />
              New HH Profile
            </Link>
          </Button>
        }
      />
      <HouseholdsList households={households} />
    </section>
  )
}

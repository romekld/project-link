import { describe, expect, it } from "vitest"

import { getDashboardShellPolicy } from "./get-dashboard-shell-policy"

describe("getDashboardShellPolicy", () => {
  it("hides the shared header and removes main padding for the GIS route", () => {
    expect(getDashboardShellPolicy("/cho/analytics/gis")).toEqual({
      hideHeader: true,
      removeMainPadding: true,
    })
  })

  it("keeps the default shell behavior for other dashboard routes", () => {
    expect(getDashboardShellPolicy("/cho/dashboard")).toEqual({
      hideHeader: false,
      removeMainPadding: false,
    })
  })

  it("does not apply the GIS shell policy to nested GIS paths", () => {
    expect(getDashboardShellPolicy("/cho/analytics/gis/map")).toEqual({
      hideHeader: false,
      removeMainPadding: false,
    })
  })
})

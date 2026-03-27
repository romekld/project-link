/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react'

export interface Breadcrumb {
  label: string
  href?: string
}

export interface PageMeta {
  title: string
  description?: string
  breadcrumbs: Breadcrumb[]
}

const defaultMeta: PageMeta = { title: '', breadcrumbs: [] }

const PageContext = createContext<{
  meta: PageMeta
  setMeta: (meta: PageMeta) => void
}>({ meta: defaultMeta, setMeta: () => {} })

export function PageProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<PageMeta>(defaultMeta)
  return (
    <PageContext.Provider value={{ meta, setMeta }}>
      {children}
    </PageContext.Provider>
  )
}

export function usePageMeta() {
  return useContext(PageContext).meta
}

export function useSetPageMeta(meta: PageMeta) {
  const { setMeta } = useContext(PageContext)
  const key = JSON.stringify(meta)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { setMeta(JSON.parse(key) as PageMeta) }, [key])
}

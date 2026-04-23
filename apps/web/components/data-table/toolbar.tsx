"use client"

import { Cross2Icon } from '@radix-ui/react-icons'
import { Search } from 'lucide-react'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filter...',
  searchKey,
  filters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter
  const searchColumn = searchKey ? table.getColumn(searchKey) : undefined

  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-2 sm:flex-row sm:items-center'>
        {searchKey ? (
          <InputGroup className='w-full max-w-[350px]'>
            <InputGroupInput
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={(searchColumn?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                searchColumn?.setFilterValue(event.target.value)
              }
              className=''
            />
            <InputGroupAddon align='inline-start'>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <InputGroup className='w-full max-w-[350px]'>
            <InputGroupInput
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={table.getState().globalFilter ?? ''}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className=''
            />
            <InputGroupAddon align='inline-start'>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        )}
        <div className='flex flex-wrap gap-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}

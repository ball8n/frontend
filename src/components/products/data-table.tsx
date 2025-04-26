"use client"
import * as React from "react"
import { Button } from "@/components/ui/button";
import { Check, Filter, X } from "lucide-react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}
 
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
      )
    const [rowSelection, setRowSelection] = React.useState({})
    
    // Search function to handle global filtering
    const onSearch = React.useCallback((value: string) => {
      setSearchQuery(value);
    }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
        columnFilters,
        rowSelection,
        globalFilter: searchQuery,
      },
    onGlobalFilterChange: setSearchQuery,
    globalFilterFn: "includesString",
  })
 
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between py-4">
            <Input
              placeholder="Search by SKU, ASIN, or Item Name..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="max-w-sm rounded-lg"
            />
        </div>
      </div>
      {/* Custom built table */}
      <div>
       <div className="rounded-md border">
         <Table>
           <TableHeader>
             {table.getHeaderGroups().map((headerGroup) => (
               <TableRow key={headerGroup.id}>
                 {headerGroup.headers.map((header) => {
                   return (
                     <TableHead key={header.id}>
                       {header.isPlaceholder
                         ? null
                         : flexRender(
                             header.column.columnDef.header,
                             header.getContext()
                           )}
                     </TableHead>
                   )
                 })}
               </TableRow>
             ))}
           </TableHeader>
           <TableBody>
             {table.getRowModel().rows?.length ? (
               table.getRowModel().rows.map((row) => (
                 <TableRow
                   key={row.id}
                   data-state={row.getIsSelected() && "selected"}
                 >
                   {row.getVisibleCells().map((cell) => (
                     <TableCell key={cell.id}>
                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                     </TableCell>
                   ))}
                 </TableRow>
               ))
             ) : (
               <TableRow>
                 <TableCell colSpan={columns.length} className="h-24 text-center">
                   No results.
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
        </div>
         <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">
              Showing <strong>{table.getPaginationRowModel().rows.length} </strong> of <strong>{data.length}</strong> products
            </span>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium">Rows per page</p>
                <select 
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value))
                  }}
                  className="h-8 w-16 rounded-md border border-input bg-background px-2"
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <span>{"<<"}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <span>{"<"}</span>
                </Button>
                <span className="text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <span>{">"}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <span>{">>"}</span>
                </Button>
              </div>
            </div>
         </div>
       </div>
       </div>
  );
};
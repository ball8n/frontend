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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
        columnFilters,
        rowSelection,
      },
  })
 
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between py-4">
            <Input
              placeholder="Search by SKU, ASIN, or Item Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm rounded-lg"
            />
            <div className="flex items-center gap-2">
            <Button 
              variant={table.getFilteredSelectedRowModel().rows.length ? "default" : "outline"} 
              size="sm" 
              className="rounded-lg flex items-center gap-1"
              onClick={() => table.getFilteredSelectedRowModel().rows}
            >
              <Filter className="h-4 w-4" />
              {table.getFilteredSelectedRowModel().rows.length? "Showing Selected" : "Show Selected"}
            </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg flex items-center gap-1 text-red-500"
                onClick={() => table.resetRowSelection()}
              >
                <X className="h-4 w-4" />
                Clear Selection
              </Button>
            </div>
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
         <div className="flex items-center justify-between text-sm text-muted-foreground">
           <span>
           <strong>{table.getFilteredSelectedRowModel().rows.length}</strong> of{" "}
             <strong>{table.getFilteredRowModel().rows.length}</strong> row(s) selected.
           </span>
         </div>
       </div>
       </div>
  );
};
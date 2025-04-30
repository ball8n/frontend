"use client"
import * as React from "react"
import { Button } from "@/components/ui/button";
import { Check, Filter, PlusCircle, X } from "lucide-react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFacetedUniqueValues,
    useReactTable,
    Column,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Define types for filter values
type FilterValue = 
  | string 
  | { min?: number; max?: number } 
  | string[];

type ActiveFilter = {
  id: string;
  value: FilterValue;
  type: 'string' | 'number' | 'select';
  displayName: string; // To display filter nicely
};

// Type for column meta data
type ColumnMeta = {
  filterable?: boolean;
  filterType?: 'string' | 'number' | 'select';
  filterOptions?: string[];
};

// Adjust ColumnMeta definition to include headerName implicitly via intersection
type ColumnMetaWithOptions = ColumnMeta & { headerName: string };

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

// Filter component to render in the header
// function FilterInput<TData, TValue>({ column }: { column: Column<TData, TValue> }) { ... }
 
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = React.useState({})

    // --- State for configuring a NEW filter --- 
    const [newFilterColumnId, setNewFilterColumnId] = React.useState<string>("")
    // Store the meta of the selected column for easy access
    const [selectedColumnMeta, setSelectedColumnMeta] = React.useState<ColumnMetaWithOptions | null>(null);
    // State for the value input, adapted for different types
    const [newStringValue, setNewStringValue] = React.useState<string>("");
    const [newNumberMin, setNewNumberMin] = React.useState<string>("");
    const [newNumberMax, setNewNumberMax] = React.useState<string>("");
    const [newSelectValues, setNewSelectValues] = React.useState<string[]>([]); 
    // --- End New Filter State --- 

    const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
    
    const filterableColumns = React.useMemo(() => 
      columns.filter(col => 
        'accessorKey' in col && (col.meta as ColumnMeta)?.filterable
      ),
      [columns]
    );

    const columnIdToMetaMap = React.useMemo(() => {
      // Use the combined type here
      const map = new Map<string, ColumnMetaWithOptions>();
      filterableColumns.forEach(col => {
        if ('accessorKey' in col) {
          const accessorKey = col.accessorKey as string;
          const headerName = typeof col.header === 'string' ? col.header : accessorKey;
          // Cast the merged object to the combined type
          map.set(accessorKey, { ...(col.meta as ColumnMeta ?? {}), headerName } as ColumnMetaWithOptions); 
        }
      });
      return map;
    }, [filterableColumns]);

    // Update selectedColumnMeta when newFilterColumnId changes
    React.useEffect(() => {
      const meta = columnIdToMetaMap.get(newFilterColumnId);
      setSelectedColumnMeta(meta || null);
      // Reset input values when column changes
      setNewStringValue("");
      setNewNumberMin("");
      setNewNumberMax("");
      setNewSelectValues([]);
    }, [newFilterColumnId, columnIdToMetaMap]);

    React.useEffect(() => {
      const tableFilters = activeFilters.map(f => {
        let filterValue: any;
        if (f.type === 'number' && typeof f.value === 'object' && f.value !== null) {
          // Type guard for number filter value
          const numberValue = f.value as { min?: number; max?: number };
          filterValue = [numberValue.min ?? -Infinity, numberValue.max ?? Infinity];
        } else {
          filterValue = f.value; 
        }
        return { id: f.id, value: filterValue };
      });
      setColumnFilters(tableFilters);
    }, [activeFilters]);

    const handleAddFilter = () => {
      if (!newFilterColumnId || !selectedColumnMeta?.headerName) return;

      let valueToAdd: FilterValue | null = null;
      const type = selectedColumnMeta.filterType || 'string';

      switch (type) {
        case 'string':
          if (newStringValue) valueToAdd = newStringValue;
          break;
        case 'number':
          const minStr = newNumberMin.trim();
          const maxStr = newNumberMax.trim();
          const min = minStr !== '' ? parseFloat(minStr) : undefined;
          const max = maxStr !== '' ? parseFloat(maxStr) : undefined;
          // Check if min/max are valid numbers before adding
          const validMin = (min !== undefined && !isNaN(min));
          const validMax = (max !== undefined && !isNaN(max));
          if (validMin || validMax) {
             valueToAdd = { 
               min: validMin ? min : undefined, 
               max: validMax ? max : undefined 
             };
          } else {
            // Handle error state - maybe show a message?
            console.warn("Invalid number range input");
          }
          break;
        case 'select':
          if (newSelectValues.length > 0) valueToAdd = newSelectValues;
          break;
      }

      if (valueToAdd === null) return; // Don't add if value is empty/invalid

      const newFilter: ActiveFilter = {
        id: newFilterColumnId,
        value: valueToAdd,
        type: type,
        displayName: selectedColumnMeta.headerName 
      };

      setActiveFilters(prevFilters => {
        const otherFilters = prevFilters.filter(f => f.id !== newFilterColumnId);
        return [...otherFilters, newFilter];
      });

      // Reset input fields
      setNewStringValue("");
      setNewNumberMin("");
      setNewNumberMax("");
      setNewSelectValues([]);
      // Keep the column selected? Or reset?
      // setNewFilterColumnId(""); 
    };

    const handleRemoveFilter = (columnIdToRemove: string) => {
      setActiveFilters(prevFilters => prevFilters.filter(f => f.id !== columnIdToRemove));
    };

    const handleClearAllFilters = () => {
      setActiveFilters([]);
      setNewFilterColumnId(""); 
    }

    const onSearch = React.useCallback((value: string) => {
      setSearchQuery(value);
    }, []);

    const table = useReactTable({
      data,
      columns,
      state: { columnFilters, rowSelection, globalFilter: searchQuery },
      onColumnFiltersChange: setColumnFilters, // Connect state
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(), // Needed for column filtering
      getPaginationRowModel: getPaginationRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(), // Needed for select options potentially
      onRowSelectionChange: setRowSelection,
      onGlobalFilterChange: setSearchQuery,
      globalFilterFn: "includesString",
      // Define filter functions for different types
      filterFns: {
        // Override default string filter if needed, e.g., for case-insensitivity
        // stringFilter: (row, columnId, value) => { ... },
        // TanStack Table has built-in range and array filters
        // We rely on setting the value structure correctly in useEffect
      },
    })
    
     // Helper to render the correct input based on selected column type
     const renderFilterInput = () => {
        if (!selectedColumnMeta) return null;
    
        switch (selectedColumnMeta.filterType) {
          case 'number':
            return (
              <div className="flex items-center space-x-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={newNumberMin}
                  onChange={(e) => setNewNumberMin(e.target.value)}
                  className="max-w-[80px] rounded-lg h-9"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={newNumberMax}
                  onChange={(e) => setNewNumberMax(e.target.value)}
                  className="max-w-[80px] rounded-lg h-9"
                />
              </div>
            );
          case 'select':
            const options = selectedColumnMeta.filterOptions || [];
            // Use table.getColumn(newFilterColumnId)?.getFacetedUniqueValues() for dynamic options
            return (
              <div className="flex flex-wrap gap-x-3 gap-y-1 p-1 border rounded-md max-w-xs">
                {options.map(option => (
                  <div key={option} className="flex items-center space-x-1">
                    <Checkbox
                      id={`filter-${newFilterColumnId}-${option}`}
                      checked={newSelectValues.includes(option)}
                      onCheckedChange={(checked) => {
                        setNewSelectValues(prev => 
                          checked 
                            ? [...prev, option] 
                            : prev.filter(item => item !== option)
                        );
                      }}
                    />
                    <Label htmlFor={`filter-${newFilterColumnId}-${option}`} className="text-sm font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            );
          case 'string':
          default:
            return (
              <Input
                placeholder="Filter value..."
                value={newStringValue}
                onChange={(e) => setNewStringValue(e.target.value)}
                className="max-w-sm rounded-lg h-9"
              />
            );
        }
      };

      // Helper to format filter value for display in badges
      const formatFilterValueForDisplay = (filter: ActiveFilter): string => {
        switch (filter.type) {
          case 'number':
            const { min, max } = filter.value as { min?: number; max?: number };
            if (min !== undefined && max !== undefined) return `${min} - ${max}`;
            if (min !== undefined) return `>= ${min}`;
            if (max !== undefined) return `<= ${max}`;
            return "Invalid range";
          case 'select':
            return (filter.value as string[]).join(', ');
          case 'string':
          default:
            return `"${filter.value as string}"`;
        }
      };

  return (
    <div className="space-y-4">
      {/* Top bar with Search and Filter Configuration */}
      <div className="flex items-start justify-between py-4 space-x-4">
        {/* Global Search Input */}
        <Input
          placeholder="Search all columns..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-sm rounded-lg h-9"
        />
        
        {/* Column Filter Configuration Controls */} 
        <div className="flex items-start space-x-2">
          <Select 
            value={newFilterColumnId} 
            onValueChange={setNewFilterColumnId} // This triggers useEffect to update meta and clear inputs
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by column..." />
            </SelectTrigger>
            <SelectContent>
              {filterableColumns.map((col) => {
                 const accessorKey = (col as any).accessorKey as string;
                 const header = columnIdToMetaMap.get(accessorKey)?.headerName || accessorKey;
                 return (
                   <SelectItem key={accessorKey} value={accessorKey}>{header}</SelectItem>
                 )
              })}
            </SelectContent>
          </Select>

          {/* Dynamic Filter Input Area */} 
          {renderFilterInput()} 

          <Button 
            onClick={handleAddFilter} 
            disabled={!newFilterColumnId /* Add more specific disabled logic based on input values later */} 
            size="sm" className="self-start h-9" // Align button
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add
          </Button>
          <Button 
             variant="ghost" 
             onClick={handleClearAllFilters} 
             disabled={activeFilters.length === 0}
             size="sm" className="self-start h-9" // Align button
          >
             <X className="h-4 w-4 mr-1" /> Clear All
          </Button>
        </div>
      </div>

      {/* Display Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="flex items-center">
              {filter.displayName}: {formatFilterValueForDisplay(filter)}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1"
                onClick={() => handleRemoveFilter(filter.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

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
                        <div>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </div>
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
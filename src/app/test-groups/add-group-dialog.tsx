"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Check, Filter, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { products } from "@/data/products";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Product } from "@/components/products/columns";

interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (groupName: string, productIds: string[]) => void;
}

// Create a DataTable component to use in the dialog
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onSelectedProductsChange: (productIds: string[]) => void
}

function ProductDataTable<TData, TValue>({
  columns,
  data,
  onSelectedProductsChange,
}: DataTableProps<TData, TValue>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [showSelected, setShowSelected] = useState(false);

  // Apply search filter
  const handleSearch = (searchValue: string) => {
    setSearchQuery(searchValue);
    setColumnFilters(
      searchValue
        ? [
            {
              id: "name",
              value: searchValue,
            },
            {
              id: "sku",
              value: searchValue,
            },
            {
              id: "asin",
              value: searchValue,
            },
          ]
        : []
    );
  };

  // Set up the table
  const table = useReactTable({
    data: data as TData[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      rowSelection,
    },
    enableMultiRowSelection: true,
  });

  // Update the parent component when selection changes
  useEffect(() => {
    const selectedProductIds = table.getFilteredRowModel().rows
      .filter(row => row.getIsSelected())
      .map(row => (row.original as Product).id);
    
    onSelectedProductsChange(selectedProductIds);
  }, [rowSelection, table, onSelectedProductsChange]);

  // Filter to show only selected items
  useEffect(() => {
    if (showSelected) {
      // This only shows selected rows
      table.getRowModel().rows.forEach(row => {
        if (!row.getIsSelected()) {
          row.toggleSelected(false);
        }
      });
    }
  }, [showSelected, table]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by SKU, ASIN, or name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm rounded-lg"
        />
        <div className="flex items-center gap-2">
          <Button 
            variant={showSelected ? "default" : "outline"} 
            size="sm" 
            className="rounded-lg flex items-center gap-1"
            onClick={() => setShowSelected(!showSelected)}
          >
            <Filter className="h-4 w-4" />
            {showSelected ? "Showing Selected" : "Show Selected"}
          </Button>
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg flex items-center gap-1 text-red-500"
              onClick={() => table.resetRowSelection()}
            >
              <X className="h-4 w-4" />
              Clear Selection
            </Button>
          )}
        </div>
      </div>
      
      <div className="rounded-lg border overflow-hidden bg-white">
        <div className="max-h-[320px] overflow-y-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      row.getIsSelected() ? 'bg-blue-50' : 'bg-white'
                    }`}
                    onClick={() => row.toggleSelected(!row.getIsSelected())}
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
                    {showSelected 
                      ? "No products selected. Select some products first." 
                      : "No results found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Selected <strong>{table.getFilteredSelectedRowModel().rows.length}</strong> of{" "}
          <strong>{table.getFilteredRowModel().rows.length}</strong> products
        </span>
      </div>
    </div>
  );
}

export function AddGroupDialog({ open, onOpenChange, onAddGroup }: AddGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setGroupName("");
      setSelectedProducts([]);
    }
  }, [open]);

  const handleCreateGroup = () => {
    onAddGroup(groupName, selectedProducts);
    onOpenChange(false);
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/products/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log(result);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchData();
  }, []);

  // Define columns for the table
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "sku",
        header: "SKU",
      },
      {
        accessorKey: "asin",
        header: "ASIN",
        cell: ({ row }) => (
          <a href={`https://www.amazon.com/dp/${row.original.asin}`} 
             target="_blank" 
             rel="noopener noreferrer"
             className="text-blue-600 hover:underline"
             onClick={(e) => e.stopPropagation()}
          >
            {row.original.asin}
          </a>
        ),
      },
      {
        accessorKey: "item_name",
        header: "Item Name",
      },
      {
        accessorKey: "price",
        header: "Price",
        // cell: ({ row }) => `€${row.original.price.toFixed(2)}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.original.status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {row.original.status}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] rounded-xl">
        <DialogHeader>
          <DialogTitle>Add New Test Group</DialogTitle>
          <DialogDescription>
            Create a new test group by selecting products and providing a group name.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <Label htmlFor="group-name">Group Name</Label>
          <Input 
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
            className="mt-1 rounded-lg"
          />
        </div>

        <div className="my-4">
          <Label>Select Products</Label>
          <div className="mt-2">
            <ProductDataTable 
              columns={columns} 
              data={data}
              onSelectedProductsChange={setSelectedProducts}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="default"
            className="rounded-lg flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleCreateGroup} 
            disabled={!groupName.trim() || selectedProducts.length === 0}
          >
            <Check className="h-4 w-4" />
            Submit ({selectedProducts.length} products)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
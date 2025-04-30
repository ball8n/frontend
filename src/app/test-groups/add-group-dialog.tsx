"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
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
import { DataTable } from "@/components/data-table/data-table";
import { Product } from "@/components/data-table/columns";
import {
  ColumnDef,
} from "@tanstack/react-table";

interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (groupName: string, productIds: string[]) => void;
}

export function AddGroupDialog({ open, onOpenChange, onAddGroup }: AddGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);

  const dialogProductColumns = useMemo<ColumnDef<Product>[]>(() => [
    { accessorKey: "seller_sku", header: "SKU", meta: { filterable: true, filterType: 'string' } },
    { accessorKey: "asin", header: "ASIN", meta: { filterable: true, filterType: 'string' } },
    { accessorKey: "item_name", header: "Item Name", meta: { filterable: true, filterType: 'string' } },
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/products/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setProductsData(result as Product[]);
      } catch (error) {
        console.error("Failed to fetch products for dialog:", error);
        setProductsData([]);
      }
    };
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setGroupName("");
      setSelectedProductIds([]);
    }
  }, [open]);

  const handleSelectionChange = useCallback((selectedRows: Product[]) => {
    setSelectedProductIds(selectedRows.map(row => row.id));
  }, []);

  const handleCreateGroup = () => {
    onAddGroup(groupName, selectedProductIds);
    onOpenChange(false);
  };

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
            <DataTable 
              columns={dialogProductColumns} 
              data={productsData} 
              enableRowSelection={true}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <span className="text-sm mr-auto text-muted-foreground">
            Selected: {selectedProductIds.length}
          </span>
          <Button variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="default"
            className="rounded-lg flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleCreateGroup} 
            disabled={!groupName.trim() || selectedProductIds.length === 0}
          >
            <Check className="h-4 w-4" />
            Submit ({selectedProductIds.length} products)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
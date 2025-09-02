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
import { fetchProducts } from "@/lib/api";
import { productColumns } from "@/components/data-table/columns";
interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (groupName: string, productIds: string[]) => void;
}

export function AddGroupDialog({ open, onOpenChange, onAddGroup }: AddGroupDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      setProductError(null);
      try {
        const result = await fetchProducts();
        setProductsData(result);
      } catch (error) {
        console.error("Failed to fetch products for dialog:", error);
        setProductError(error instanceof Error ? error.message : "Failed to load products");
        setProductsData([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    if (open) {
      loadProducts();
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
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[95vh] rounded-xl flex flex-col overflow-hidden" onClose={() => onOpenChange(false)}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add New Test Group</DialogTitle>
          <DialogDescription>
            Create a new test group by selecting products and providing a group name.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-shrink-0 my-4">
          <Label htmlFor="group-name">Group Name</Label>
          <Input 
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
            className="mt-1 rounded-lg"
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <Label className="flex-shrink-0 mb-2">Select Products</Label>
          <div className="flex-1 min-h-0 max-h-[50vh]">
            {loadingProducts && <p>Loading products...</p>}
            {productError && <p className="text-red-500">Error: {productError}</p>}
            {!loadingProducts && !productError && (
              <DataTable 
                columns={productColumns} 
                data={productsData} 
                enableRowSelection={true}
                onSelectionChange={handleSelectionChange}
                maxHeight="h-[250px] max-h-[35vh]"
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6 flex-shrink-0">
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
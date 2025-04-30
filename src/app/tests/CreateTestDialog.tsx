"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TestGroup } from "@/components/data-table/columns"
import { TestGroups } from "@/data/test_groups"

// Define a dummy Product type
type Product = {
  id: string;
  name: string;
  price: number; // Base price
};

// Type for passing price updates
type ProductPriceInfo = {
    productId: string;
    controlPrice: number | null; // Use number | null for parsed floats
    testPrice: number | null;    // Use number | null for parsed floats
}

// Function to generate dummy products based on group
const generateDummyProducts = (group: TestGroup | undefined): Product[] => {
  if (!group) return [];
  const products: Product[] = [];
  for (let i = 1; i <= group.itemCount; i++) {
    products.push({
      id: `${group.id}-${i}`,
      name: `Product ${i} (Group: ${group.name})`,
      price: Math.floor(Math.random() * 100) + 10, // Random price between 10 and 110
    });
  }
  return products;
};

interface CreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTest: (name: string, startDate: Date, endDate: Date, testGroupId: string, prices: ProductPriceInfo[]) => void;
}

export function CreateTestDialog({ open, onOpenChange, onCreateTest }: CreateTestDialogProps) {
  const [currentPage, setCurrentPage] = React.useState<1 | 2>(1); // State for current page
  const [testName, setTestName] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | undefined>(undefined);
  const [products, setProducts] = React.useState<Product[]>([]); // State for products
  // State for editable prices: { productId: { controlPrice: string, testPrice: string } }
  const [editablePrices, setEditablePrices] = React.useState<Record<string, { controlPrice: string; testPrice: string }>>({});
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [groupError, setGroupError] = React.useState<string | null>(null);

  const selectedGroup = React.useMemo(() => TestGroups.find(g => g.id === selectedGroupId), [selectedGroupId]);

  // Get the start of today for disabling past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Reset state when dialog opens or closes
  React.useEffect(() => {
    if (open) {
        setCurrentPage(1); // Always start on page 1 when opened
    } else {
      // Reset all state on close
      setCurrentPage(1);
      setTestName("");
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedGroupId(undefined);
      setProducts([]);
      setEditablePrices({}); // Reset editable prices
      setNameError(null);
      setDateError(null);
      setGroupError(null);
    }
  }, [open]);

  const validatePage1 = (): boolean => {
    let isValid = true;
    setNameError(null); // Reset errors
    setDateError(null);
    setGroupError(null);

    if (!testName.trim()) {
      setNameError("Test name cannot be empty.");
      isValid = false;
    }
     if (!selectedGroupId) {
        setGroupError("A test group must be selected.");
        isValid = false;
    }
    if (!startDate || !endDate) {
      setDateError("Both start and end dates must be selected.");
       isValid = false;
    } else if (endDate < startDate) {
      setDateError("End date cannot be before start date.");
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validatePage1()) {
      const group = TestGroups.find(g => g.id === selectedGroupId);
      const generatedProducts = generateDummyProducts(group);
      setProducts(generatedProducts);

      // Initialize editable prices
      const initialPrices: Record<string, { controlPrice: string; testPrice: string }> = {};
      generatedProducts.forEach(p => {
        initialPrices[p.id] = { controlPrice: p.price.toString(), testPrice: '' }; // Control price prefilled, test price empty
      });
      setEditablePrices(initialPrices);

      setCurrentPage(2);
    }
  };

  const handleBack = () => {
    setCurrentPage(1); // Move back to page 1
  };

  // Handler for price input changes
  const handlePriceChange = (productId: string, priceType: 'controlPrice' | 'testPrice', value: string) => {
    // Basic validation: allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
        setEditablePrices(prevPrices => ({
            ...prevPrices,
            [productId]: {
                ...(prevPrices[productId] || { controlPrice: '', testPrice: '' }), // Ensure object exists
                [priceType]: value
            }
        }));
    }
  };

  const handleSubmit = () => {
    // Validation happens on Page 1 navigation

    // Convert string prices from state to numbers for submission
    const priceUpdates: ProductPriceInfo[] = products.map(product => {
        const prices = editablePrices[product.id] || { controlPrice: '', testPrice: '' };
        
        const controlPriceString = prices.controlPrice;
        const testPriceString = prices.testPrice;

        // Parse strings to float, default to null if empty or invalid
        const controlPriceNum = controlPriceString !== '' ? parseFloat(controlPriceString) : null;
        const testPriceNum = testPriceString !== '' ? parseFloat(testPriceString) : null;

        return {
            productId: product.id,
            controlPrice: (controlPriceNum !== null && !isNaN(controlPriceNum)) ? controlPriceNum : null,
            testPrice: (testPriceNum !== null && !isNaN(testPriceNum)) ? testPriceNum : null
        };
    });

    // Pass the structured price data along with other test details
    onCreateTest(testName, startDate!, endDate!, selectedGroupId!, priceUpdates);
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-lg"> {/* Increased width further */}
        <DialogHeader>
          <DialogTitle>
            {currentPage === 1 ? "Create New Price Test (Step 1/2)" : `Review Products for "${selectedGroup?.name ?? ''}" (Step 2/2)`}
            </DialogTitle>
          <DialogDescription>
            {currentPage === 1
              ? "Enter the basic details for your new price test."
              : `These are the ${selectedGroup?.itemCount ?? 0} products included in the selected test group. Review and click Create Test.`}
          </DialogDescription>
        </DialogHeader>

        {/* Page 1 Content */}
        {currentPage === 1 && (
          <div className="grid gap-4 py-4">
            {/* Test Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="test-name" className="text-right">
                Name
              </Label>
              <Input
                id="test-name"
                value={testName}
                onChange={(e) => {
                  setTestName(e.target.value);
                  if (nameError) setNameError(null); // Clear error on change
                }}
                placeholder="e.g., Summer Sale Test"
                className="col-span-3 rounded-md"
              />
            </div>
            {nameError && <p className="col-span-4 text-red-500 text-sm text-center -mt-2">{nameError}</p>}

            {/* Test Group Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="test-group" className="text-right">
                Group
              </Label>
              <Select
                value={selectedGroupId}
                onValueChange={(value) => {
                  setSelectedGroupId(value);
                  if (groupError) setGroupError(null); // Clear error on change
                }}
              >
                <SelectTrigger className="col-span-3 rounded-md">
                  <SelectValue placeholder="Select a test group" />
                </SelectTrigger>
                <SelectContent>
                  {TestGroups.map((group: TestGroup) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.itemCount} items)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {groupError && <p className="col-span-4 text-red-500 text-sm text-center -mt-2">{groupError}</p>}


            {/* Start Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Start Date
              </Label>
              <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal rounded-md",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date: Date | undefined) => {
                        setStartDate(date);
                        if (dateError) setDateError(null); // Clear error
                         // Also clear end date if start date changes and end date is before new start date
                         if (endDate && date && endDate < date) {
                             setEndDate(undefined);
                         }
                      }}
                      disabled={{ before: tomorrow }} // Disable dates before TOMORROW
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
            </div>

            {/* End Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                End Date
              </Label>
              <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal rounded-md",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date: Date | undefined) => {
                        setEndDate(date);
                        if (dateError) setDateError(null); // Clear error
                      }}
                      // Disable end dates before the selected start date OR before tomorrow, whichever is later
                      disabled={startDate ? { before: startDate } : { before: tomorrow }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
            </div>
            {dateError && <p className="col-span-4 text-red-500 text-sm text-center -mt-2">{dateError}</p>}
          </div>
        )}

        {/* Page 2 Content */}
         {currentPage === 2 && (
          <div className="py-4 max-h-[500px] overflow-y-auto"> {/* Increased max height */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Product ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="w-[150px] text-right">Control Price ($)</TableHead> {/* New Column */}
                  <TableHead className="w-[150px] text-right">Test Price ($)</TableHead>    {/* New Column */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                   <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground"> {/* Updated colSpan */} 
                        No products found for this group.
                      </TableCell>
                    </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={editablePrices[product.id]?.controlPrice ?? ''}
                          onChange={(e) => handlePriceChange(product.id, 'controlPrice', e.target.value)}
                          className="text-right rounded-md h-8"
                          placeholder="Enter price"
                           min="0"
                           step="0.01" // Allows decimal steps
                        />
                      </TableCell>
                      <TableCell className="text-right">
                         <Input
                          type="number"
                          value={editablePrices[product.id]?.testPrice ?? ''}
                          onChange={(e) => handlePriceChange(product.id, 'testPrice', e.target.value)}
                          className="text-right rounded-md h-8"
                          placeholder="Enter price"
                           min="0"
                           step="0.01" // Allows decimal steps
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
            {currentPage === 1 && (
                <>
                    <Button variant="outline" className="rounded-md" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="button" className="rounded-md bg-blue-500 hover:bg-blue-600 text-white" onClick={handleNext}>Next</Button>
                </>
            )}
             {currentPage === 2 && (
                <>
                    <Button variant="outline" className="rounded-md" onClick={handleBack}>Back</Button>
                    <Button type="submit" className="rounded-md bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSubmit}>Create Test</Button>
                </>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
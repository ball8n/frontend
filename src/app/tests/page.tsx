"use client";

import { useState } from "react";
import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/tests/data-table';
import { tests as initialTestsData } from '@/data/price_tests';
import { PriceTest } from '@/data/price_tests';
import { columns } from '@/components/tests/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateTestDialog } from "@/components/tests/CreateTestDialog";

// Import the PriceInfo type (assuming it's exported or defined accessible)
// If not exported from CreateTestDialog, might need to define it here or in a shared types file.
type ProductPriceInfo = {
    productId: string;
    controlPrice: number | null;
    testPrice: number | null;
}

/**
 * Displays and manages a list of price tests, allowing users to create new tests and view existing ones.
 *
 * Renders a page with a table of current price tests and a dialog for creating new tests. Newly created tests are added to the list and displayed in the table.
 */
export default function TestsPage() {
  const [tests, setTests] = useState<PriceTest[]>(initialTestsData);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Update handleCreateTest to accept the prices array
  const handleCreateTest = (name: string, startDate: Date, endDate: Date, testGroupId: string, prices: ProductPriceInfo[]) => {
    console.log("Creating test:", { name, startDate, endDate, testGroupId });
    console.log("Received Prices:", prices); // Log the received price data
    
    // Note: The PriceTest type currently doesn't store testGroupId or detailed prices.
    // We'll just create the test with the basic info for now.
    const newTest: PriceTest = {
      id: `test_${Date.now()}`,
      name,
      startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: endDate.toISOString().split('T')[0],   // Format as YYYY-MM-DD
      status: "planned",
      // testGroupId: testGroupId, // Would need to add this field to PriceTest type
      // priceData: prices,      // Would need to add this field to PriceTest type
    };
    
    setTests(prevTests => [...prevTests, newTest]);

    setIsCreateDialogOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Test</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Tests Management</CardTitle>
            <CardDescription>
              View and manage your price tests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={tests} columns={columns} />
          </CardContent>
        </Card>
      </div>

      <CreateTestDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateTest={handleCreateTest}
      />
    </AppShell>
  );
} 
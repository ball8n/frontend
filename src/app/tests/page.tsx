"use client";

import { useEffect, useState } from "react";
import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/data-table/data-table';
import { tests as initialTestsData } from '@/data/price_tests';
import { PriceTest, priceTestColumns } from '@/components/data-table/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { addTestDialog } from "@/app/tests/add-test-dialog";
import { createPriceTest, fetchPriceTest } from "@/lib/api";
// Import the PriceInfo type (assuming it's exported or defined accessible)
// If not exported from CreateTestDialog, might need to define it here or in a shared types file.
type ProductPriceInfo = {
    productId: string;
    controlPrice: number | null;
    testPrice: number | null;
}

export default function TestsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [data, setData] = useState<PriceTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPriceTest();
      setData(result);
    } catch (err) {
      console.error("Failed to fetch test groups:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  const handleAddTest = () => {
    setIsDialogOpen(true);
  };


  // Update handleCreateTest to accept the prices array
  const handleCreateTest = async (groupId: string, priceTestName: string,startDate: string,endDate: string ): Promise<any> => { // Adjust return type based on API
    try {
      const createdPriceTest = await createPriceTest(groupId, priceTestName,startDate,endDate);
      console.log("API Response (created price test):", createdPriceTest);
      await loadData();
    } catch (error) {
      console.error("Error creating test group:", error);
      alert(`Failed to create group: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
          <Button
            onClick={handleAddTest} 
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
            {loading && <p>Loading price tests...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <DataTable data={data} columns={priceTestColumns} />
            )}

            
          </CardContent>
        </Card>

      <addTestDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddTest={handleCreateTest}
      />
    </div>
    </AppShell>
  );
} 
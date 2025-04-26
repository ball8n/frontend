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

export default function TestsPage() {
  const [tests, setTests] = useState<PriceTest[]>(initialTestsData);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateTest = (name: string, startDate: Date, endDate: Date) => {
    console.log("Creating test:", { name, startDate, endDate });
    const newTest: PriceTest = {
      id: `test_${Date.now()}`,
      name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "planned",
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
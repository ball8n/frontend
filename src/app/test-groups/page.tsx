"use client";

import { useState } from "react";
import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/test-groups/data-table';
import { TestGroups } from '@/data/test_groups';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Product } from '@/components/products/data-table';
import { AddGroupDialog } from './add-group-dialog';

export default function TestGroupsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testGroups, setTestGroups] = useState(TestGroups);

  const handleAddGroup = () => {
    setIsDialogOpen(true);
  };

  const handleCreateGroup = (groupName: string, selectedProducts: Product[]) => {
    // Create a new group with the selected products
    const newGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      description: `Group containing ${selectedProducts.length} products`,
      productCount: selectedProducts.length,
      lastUpdated: new Date().toISOString(),
      products: selectedProducts
    };
    
    // Add the new group to the test groups
    setTestGroups([...testGroups, newGroup]);
  };

  return (
    <AppShell>
      <div className="container px-4 py-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Test Groups</h1>
            <p className="text-muted-foreground">
              Create and manage product test groups for your campaigns.
            </p>
          </div>
        </div>

        <Card className="border rounded-xl">
          <CardHeader className="px-6">
            <CardTitle>All Test Groups</CardTitle>
            <CardDescription>
              A list of all your product test groups.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <DataTable data={testGroups} onAddGroup={handleAddGroup} />
          </CardContent>
        </Card>

        <AddGroupDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onAddGroup={handleCreateGroup}
        />
      </div>
    </AppShell>
  );
}
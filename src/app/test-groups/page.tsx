"use client";

import { useEffect, useState } from "react";
import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/data-table/data-table';
import { testGroupColumns } from '@/components/data-table/columns';
import { TestGroups } from '@/data/test_groups';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Product } from '@/components/data-table/columns';
import { AddGroupDialog } from './add-group-dialog';

export default function TestGroupsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/price-test-groups/');
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

  const handleAddGroup = () => {
    setIsDialogOpen(true);
  };

  const handleCreateGroup = async (groupName: string, selectedProductIds: string[]) => {
    // Prepare the data payload for the API
    const newGroupPayload = {
      name: groupName,
      items: selectedProductIds // Use product IDs
    };

    console.log("Sending new group to API:", newGroupPayload);

    try {
      const response = await fetch('/api/price-test-groups/', { // Use the proxied API path
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGroupPayload),
      });

      if (!response.ok) {
        // Handle API errors (e.g., log error, show message to user)
        const errorData = await response.json().catch(() => ({})); // Try to get error details
        console.error(`API Error: ${response.status} ${response.statusText}`, errorData);
        // Maybe show an error toast/message to the user here
        throw new Error('Failed to create test group via API');
      }

      // Optionally, get the created group from the response if the API returns it
      const createdGroup = await response.json(); 
      console.log("API Response (created group):", createdGroup);

      // Add the new group (returned from API or constructed locally) to the test groups state
      // If the API returns the full group object, use that:
      // setTestGroups([...testGroups, createdGroup]);
      // Or, if the API just confirms success, you might need to construct the object:
      // setTestGroups([...testGroups, { ...newGroupPayload, id: createdGroup.id /* or generate locally */, products: selectedProductIds }]);

    } catch (error) {
      console.error("Error creating test group:", error);
      // Handle network errors or errors during JSON parsing
      // Show an error message to the user
    }
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
          <div>
            <Button 
              onClick={handleAddGroup} 
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Group</span>
            </Button>
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
            <DataTable data={data} columns={testGroupColumns} />
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
"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app-shell";
import { DataTable } from "@/components/data-table/data-table";
import { TestGroup, testGroupColumns } from "@/components/data-table/columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddGroupDialog } from "./add-group-dialog";
import { fetchTestGroups, createTestGroup } from "@/lib/api";

export default function TestGroupsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [data, setData] = useState<TestGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTestGroups();
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

  const handleAddGroup = () => {
    setIsDialogOpen(true);
  };

  const handleCreateGroup = async (groupName: string, selectedProductIds: string[]) => {
    console.log("Creating new group with:", { groupName, selectedProductIds });
    try {
      const createdGroup = await createTestGroup(groupName, selectedProductIds);
      console.log("API Response (created group):", createdGroup);
      await loadData();
    } catch (error) {
      console.error("Error creating test group:", error);
      alert(`Failed to create group: ${error instanceof Error ? error.message : "Unknown error"}`);
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
            {loading && <p>Loading test groups...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <DataTable data={data} columns={testGroupColumns} />
            )}
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
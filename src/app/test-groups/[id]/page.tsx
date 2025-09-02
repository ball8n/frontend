"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AppShell from "@/components/app-shell";
import { DataTable } from "@/components/data-table/data-table";
import { ProductGroupInfo, PriceTest, createProductGroupItemColumns, priceTestColumns } from "@/components/data-table/columns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowLeft } from "lucide-react";
import { fetchTestGroupById, fetchPriceTestsByGroup } from "@/lib/api";

export default function TestGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [groupInfo, setGroupInfo] = useState<ProductGroupInfo | null>(null);
  const [priceTests, setPriceTests] = useState<PriceTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroupData = async () => {
    if (!groupId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [groupData, testsData] = await Promise.all([
        fetchTestGroupById(groupId),
        fetchPriceTestsByGroup(groupId)
      ]);
      
      setGroupInfo(groupData);
      setPriceTests(testsData);
    } catch (err) {
      console.error("Failed to fetch group data:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const handleViewDashboard = () => {
    router.push(`/dashboard?groupId=${groupId}`);
  };

  const handleBackToGroups = () => {
    router.push('/test-groups');
  };

  // Create columns for the product items
  const productColumns = createProductGroupItemColumns();

  if (loading) {
    return (
      <AppShell>
        <div className="container px-4 py-6 lg:px-8 space-y-6">
          <p>Loading test group details...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !groupInfo) {
    return (
      <AppShell>
        <div className="container px-4 py-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={handleBackToGroups}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Groups
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>
                {error || "Failed to load test group data"}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container px-4 py-6 lg:px-8 space-y-6">
        {/* Header with navigation and actions */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToGroups}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test Groups
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{groupInfo.name}</h1>
            <p className="text-muted-foreground">
              {groupInfo.items.length} products • {groupInfo.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        {/* Products in this group */}
        <Card className="border rounded-xl">
          <CardHeader className="px-6">
            <CardTitle>Products in Group</CardTitle>
            <CardDescription>
              All products included in this test group.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <DataTable 
              data={groupInfo.items} 
              columns={productColumns} 
              maxHeight="h-[400px]"
            />
          </CardContent>
        </Card>

        {/* Price tests for this group */}
        <Card className="border rounded-xl">
          <CardHeader className="px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Price Tests</CardTitle>
                <CardDescription>
                  All price tests associated with this test group.
                </CardDescription>
              </div>
              <Button 
                onClick={handleViewDashboard} 
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <BarChart3 className="h-4 w-4" />
                View Dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            {priceTests.length > 0 ? (
              <DataTable 
                data={priceTests} 
                columns={priceTestColumns} 
                maxHeight="h-[400px]"
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No price tests found for this group.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
} 
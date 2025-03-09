"use client";

import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/test-groups/data-table';
import { TestGroups } from '@/data/test_groups';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function TestGroupsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Test Groups</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Groups</CardTitle>
            <CardDescription>
              Manage your Test Groups. Search by Test Group Name, SKU, ASIN, or product name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={TestGroups} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
    );
  } 
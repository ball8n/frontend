"use client";

import { useState } from "react";
import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/tests/data-table';
import { tests } from '@/data/tests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestsPage() {
  const handleAddTest = () => {
    // This would normally open a dialog to add a new test
    alert("Add Test dialog would open here");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Tests Management</CardTitle>
            <CardDescription>
              View and manage your tests. Search by test name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={tests} onAddTest={handleAddTest} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
} 
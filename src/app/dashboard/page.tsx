"use client";

import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import AppShell from '@/components/app-shell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamically import the Dashboard component to avoid server-side rendering issues with charts
const Dashboard = dynamic(() => import('@/components/dashboard/dashboard'), {
  ssr: false,
  loading: () => <DashboardSkeleton />
});

import DashboardSkeleton from '@/components/dashboard/dashboard-skeleton';

// Currently we only have one test group
const TEST_GROUPS = [
  { id: "blocher", name: "Blocher Glasses Group" }
];

export default function DashboardPage() {
  const [selectedGroup, setSelectedGroup] = useState(TEST_GROUPS[0].id);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Test Analysis Dashboard</h1>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select a test group" />
            </SelectTrigger>
            <SelectContent>
              {TEST_GROUPS.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedGroup ? (
          <Suspense fallback={<DashboardSkeleton />}>
            <Dashboard groupId={selectedGroup} />
          </Suspense>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Test Group Selected</CardTitle>
              <CardDescription>
                Please select a test group to view the dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </AppShell>
  );
} 
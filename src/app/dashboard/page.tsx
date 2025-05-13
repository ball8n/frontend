"use client";

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import AppShell from '@/components/app-shell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTestGroups } from '@/lib/api';

// Dynamically import the Dashboard component to avoid server-side rendering issues with charts
const Dashboard = dynamic(() => import('@/components/dashboard/dashboard'), {
  ssr: false,
  loading: () => <DashboardSkeleton />
});

import DashboardSkeleton from '@/components/dashboard/dashboard-skeleton';

export default function DashboardPage() {
  const [testGroups, setTestGroups] = useState<{ id: string, name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestGroups = async () => {
      try {
        const groups = await fetchTestGroups();
        setTestGroups(groups);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load test groups');
        setIsLoading(false);
        console.error(err);
      }
    };

    loadTestGroups();
  }, []);

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Test Analysis Dashboard</h1>
            <Skeleton className="h-10 w-[240px]" />
          </div>
          <DashboardSkeleton />
        </div>
      </AppShell>
    );
  }
  
  if (error) {
    return (
      <AppShell>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Test Analysis Dashboard</h1>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select a group..." />
            </SelectTrigger>
            <SelectContent>
              {testGroups.map((group) => (
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
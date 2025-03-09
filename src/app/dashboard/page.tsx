"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import AppShell from '@/components/app-shell';

// Dynamically import the Dashboard component to avoid server-side rendering issues with charts
const Dashboard = dynamic(() => import('@/components/dashboard/dashboard'), {
  ssr: false,
  loading: () => <DashboardSkeleton />
});

import DashboardSkeleton from '@/components/dashboard/dashboard-skeleton';

export default function DashboardPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Test Analysis Dashboard</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </AppShell>
  );
} 
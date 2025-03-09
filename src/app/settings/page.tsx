"use client";

import AppShell from '@/components/app-shell';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Settings Placeholder</h2>
          <p className="text-muted-foreground">This is a placeholder for the settings configuration.</p>
        </div>
      </div>
    </AppShell>
  );
} 
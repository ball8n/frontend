"use client";

import AppShell from '@/components/app-shell';
import { Product, columns } from "./columns_group"
import { DataTable } from "./data-table_group"
import { products } from "@/data/products"

/**
 * Displays a data table of products within the application shell.
 *
 * Renders the {@link DataTable} component with product data and column configuration inside the {@link AppShell} layout.
 */
export default function ReportsPage() {
  const data = products
  return (
    <AppShell>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </AppShell>
  );
} 

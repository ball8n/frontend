"use client";

import AppShell from '@/components/app-shell';
import { Product, columns } from "./columns_group"
import { DataTable } from "./data-table_group"
import { products } from "@/data/products"

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

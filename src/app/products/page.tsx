"use client";

import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/products/data-table';
import { products } from '@/data/products';
import { columns } from '@/components/products/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductsPage() {
  const data = products
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>
              Manage your product inventory. Search by SKU, ASIN, or product name.
            </CardDescription>
          </CardHeader>
          <CardContent>
          <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
} 
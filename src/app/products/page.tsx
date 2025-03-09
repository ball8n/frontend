"use client";

import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/products/data-table';
import { products } from '@/data/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            Add Product
          </button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>
              Manage your product inventory. Search by SKU, ASIN, or product name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={products} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
} 
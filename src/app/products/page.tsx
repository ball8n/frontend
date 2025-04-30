"use client";

import { useEffect, useState } from 'react';
import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/data-table/data-table';
import { Product, productColumns } from '@/components/data-table/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchProducts } from '@/lib/api';

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProducts();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
            {loading && <p>Loading products...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <DataTable columns={productColumns} data={data} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
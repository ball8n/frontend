"use client";

import { useEffect, useState } from 'react';
import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/data-table/data-table';
import { productColumns } from '@/components/data-table/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/products/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log(result);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchData();
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
          <DataTable columns={productColumns} data={data} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
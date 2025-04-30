"use client";

import { useEffect, useState } from 'react';
import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/products/data-table';
import { columns } from '@/components/products/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Displays the product inventory page, fetching and rendering a list of products in a data table.
 *
 * @remark
 * Product data is fetched from the `/api/products/` endpoint on component mount. If the fetch fails, errors are logged to the console but not displayed in the UI.
 */
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
          <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
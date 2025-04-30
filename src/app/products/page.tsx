"use client";

import { useEffect, useState } from 'react';
import AppShell from '@/components/app-shell';
import { DataTable } from '@/components/products/data-table';
import { columns } from '@/components/products/columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuth, onAuthStateChanged, User } from "firebase/auth"; // Import Firebase auth functions
import { app } from "@/lib/firebase"; // Import Firebase app instance
import type { FirebaseApp } from 'firebase/app'; // Import FirebaseApp type

export default function ProductsPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    const auth = getAuth(app as FirebaseApp);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // User is signed in
        try {
          const token = await user.getIdToken(); // Get the ID token
          console.log("Firebase ID Token:", token); // Log the token

          const fetchOptions = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          };

          console.log("Fetching /api/products/ with options:", fetchOptions); // Log the options object

          const response = await fetch('/api/products/', fetchOptions);
          console.log(response);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const result = await response.json();
          console.log(result); // Keep console log for debugging if needed
          setData(result);
          setError(null); // Clear error on success
        } catch (err) {
          console.error("Failed to fetch products:", err);
          setError(err instanceof Error ? err.message : "An unknown error occurred");
          setData([]); // Clear data on error
        } finally {
          setIsLoading(false); // Set loading to false after fetch attempt
        }
      } else {
        // User is signed out
        console.log("User is not authenticated. Cannot fetch products.");
        setData([]); // Clear data if user is not logged in
        setError("Authentication required to view products."); // Set appropriate error message
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();

  }, []); // Empty dependency array ensures this runs once on mount

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
            {isLoading ? (
              <p>Loading products...</p> // Show loading indicator
            ) : error ? (
              <p className="text-red-500">Error: {error}</p> // Show error message
            ) : (
              <DataTable columns={columns} data={data} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
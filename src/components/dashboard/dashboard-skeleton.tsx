'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Test Info Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[130px]" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
      
      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-6 w-[50px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Comparison Chart Skeleton */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daily Comparison</CardTitle>
              <Skeleton className="h-4 w-[200px] mt-1" />
            </div>
            <Skeleton className="h-9 w-[180px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
        
        {/* Product Performance Chart Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
            <Skeleton className="h-4 w-[200px] mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-full" />
          </CardContent>
        </Card>
        
        {/* Order Status Chart Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <Skeleton className="h-4 w-[150px] mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-full" />
          </CardContent>
        </Card>
      </div>
      
      {/* ASIN Comparison Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>ASIN Comparison</CardTitle>
          <Skeleton className="h-4 w-[200px] mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

// Import PriceTest from the data file
import { PriceTest } from "@/data/price_tests"

// Helper function to determine badge variant based on status
const getStatusVariant = (status: PriceTest["status"]): "default" | "secondary" | "outline" | "destructive" | "success" => {
  switch(status) {
    case "running":
      return "success" // Using success from shadcn/ui Badge variants
    case "completed":
      return "default"
    case "paused":
      return "secondary"
    case "planned":
      return "outline"
    default:
      // Provide a fallback variant for unexpected statuses
      console.warn("Unknown status encountered:", status)
      return "default"
  }
}

// Helper function to format date (handle potential invalid dates)
const formatDate = (dateString: string) => {
  try {
    // Ensure date string is treated consistently, assuming YYYY-MM-DD
    const date = new Date(dateString + 'T00:00:00'); // Treat as local midnight
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString('en-US', { // Use consistent locale
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid Date"; // Fallback for errors
  }
}

export const columns: ColumnDef<PriceTest>[] = [
  {
    accessorKey: "name",
    header: "Price Test Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => formatDate(row.original.startDate), // Apply formatting
  },
   {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => formatDate(row.original.endDate), // Apply formatting
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusVariant(status)}>
          {status}
        </Badge>
      );
    },
  },
  // Add an actions column if needed, e.g., using DropdownMenu
  // Remember to import necessary components like Button, DropdownMenu, etc.
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //      return (
  //         <p>Actions placeholder</p>
  //      )
  //   }
  // }
] 
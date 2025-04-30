import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PriceTest } from "@/data/price_tests"

export type Product = {
    id: string;
    seller_sku: string;
    asin: string;
    item_name: string;
    price: number;
    status: "Active" | "Inactive";
  }

  export const productColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "seller_sku",
      header: "SKU",
      meta: {
        filterable: true,
        filterType: 'string',
      }
    },
    {
      accessorKey: "asin",
      header: "ASIN",
      cell: ({ row }) => (
        <a href={`https://www.amazon.de/dp/${row.original.asin}`}
           target="_blank"
           rel="noopener noreferrer"
           className="text-blue-600 hover:underline"
           onClick={(e) => e.stopPropagation()}
        >
          {row.original.asin}
        </a>
      ),
      meta: {
        filterable: true,
        filterType: 'string',
      }
    },
    {
      accessorKey: "item_name",
      header: "Item Name",
      meta: {
        filterable: true,
        filterType: 'string',
      }
    },
    {
      accessorKey: "price",
      header: "Price",
      meta: {
        filterable: true,
        filterType: 'number',
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.status}
        </span>
      ),
      meta: {
        filterable: true,
        filterType: 'select',
        filterOptions: ['Active', 'Inactive'],
      }
    },
  ]





  export type TestGroup = {
    id: string;
    name: string;
    count: number; 
  }
  
  export const testGroupColumns: ColumnDef<TestGroup>[] = [
    {
      accessorKey: "name",
      header: "Group Name",
      meta: { // Allow filtering by name
        filterable: true,
        filterType: 'string',
      }
    },
    {
      accessorKey: "count",
      header: "Number of Items",
      // Not filterable by default, add meta if needed
    },
  ]

// ===================================
// Price Test Columns
// ===================================
export type PriceTest = {
  id: string;
  name: string;
  startDate: string; // Keep as string if data source is string
  endDate: string;   // Keep as string if data source is string
  status: "completed" | "running" | "planned" | "paused";
  // Add optional fields for future use if needed
  // testGroupId?: string;
  // priceData?: any[]; // Define a proper type later
};
// Helper function to determine badge variant based on status
const getStatusVariant = (status: PriceTest["status"]): "default" | "secondary" | "outline" | "destructive" | "success" => {
  switch(status) {
    case "running":
      return "success"
    case "completed":
      return "default"
    case "paused":
      return "secondary"
    case "planned":
      return "outline"
    default:
      console.warn("Unknown price test status encountered:", status)
      return "default"
  }
}

// Helper function to format date (handle potential invalid dates)
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString + 'T00:00:00'); 
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid Date";
  }
}

export const priceTestColumns: ColumnDef<PriceTest>[] = [
  {
    accessorKey: "name",
    header: "Price Test Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
    meta: { // Add filterable meta if desired
      filterable: true,
      filterType: 'string',
    }
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => formatDate(row.original.startDate), 
    // Add meta for date filtering if needed (more complex)
  },
   {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => formatDate(row.original.endDate), 
    // Add meta for date filtering if needed
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
    meta: { // Add meta for select filtering
      filterable: true,
      filterType: 'select',
      filterOptions: ['running', 'completed', 'paused', 'planned'], // Use actual statuses
    }
  },
]
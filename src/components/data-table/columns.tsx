import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

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
        filterType: "string",
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
        filterType: "string",
      }
    },
    {
      accessorKey: "item_name",
      header: "Item Name",
      meta: {
        filterable: true,
        filterType: "string",
      }
    },
    {
      accessorKey: "price",
      header: "Price",
      meta: {
        filterable: true,
        filterType: "number",
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === "Active"
            ? "bg-green-100 text-green-800" 
            : "bg-gray-100 text-gray-800"
        }`}>
          {row.original.status}
        </span>
      ),
      meta: {
        filterable: true,
        filterType: "select",
        filterOptions: ["Active", "Inactive"],
      }
    },
  ]





  export type TestGroup = {
    id: string;
    name: string;
    count: number;
    is_active: boolean;
  }
  
  export const createTestGroupColumns = (
  onViewDashboard: (groupId: string) => void,
  onViewDetails?: (groupId: string) => void
): ColumnDef<TestGroup>[] => [
  {
    accessorKey: "name",
    header: "Group Name",
    meta: { // Allow filtering by name
      filterable: true,
      filterType: "string",
    }
  },
  {
    accessorKey: "count",
    header: "Number of Items",
    // Not filterable by default, add meta if needed
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const handleViewDashboard = () => {
        onViewDashboard(row.original.id);
      };
      
      const handleViewDetails = () => {
        onViewDetails?.(row.original.id);
      };
      
      return (
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex items-center gap-2"
            >
              View Details
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
]

// Keep the original columns for backward compatibility (without actions)
export const testGroupColumns: ColumnDef<TestGroup>[] = [
  {
    accessorKey: "name",
    header: "Group Name",
    meta: { // Allow filtering by name
      filterable: true,
      filterType: "string",
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
export type PriceTestItemIn = {
  id: string; // product_group_item_id (UUID)
  control_price: number;
  test_price_1: number;
  test_price_2?: number;
  test_price_3?: number;
  asin?: string;
};

export type PriceTest = {
  id: string;
  name: string;
  group_id: string;
  group_name: string;
  start_date: string; // Keep as string if data source is string
  end_date: string;   // Keep as string if data source is string
  status: "completed" | "running" | "paused" | "scheduled" | "cancelled";
  control_price_test_id?: string; // Optional field for control test reference
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
    case "scheduled":
      return "outline"
    case "cancelled":
      return "destructive"
    default:
      console.warn("Unknown price test status encountered:", status)
      return "default"
  }
}

// Helper function to format date (handle potential invalid dates)
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString + "T00:00:00"); 
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", { 
      year: "numeric", month: "short", day: "numeric"
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
      filterType: "string",
    }
  },
  {
    accessorKey: "group",
    header: "Group Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.group_name}</span>
    ),
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => formatDate(row.original.start_date), 
    // Add meta for date filtering if needed (more complex)
  },
   {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => formatDate(row.original.end_date), 
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
      filterType: "select",
      filterOptions: ["running", "completed", "paused", "scheduled", "cancelled"], // Use actual statuses
    }
  },
]

export type ProductGroupInfo = {
  id: string;
  name: string;
  is_active: boolean;
  items: ProductGroupItem[];
}

export type ProductGroupItem = {
  id: string;
  listing_id: string;
  asin: string;
  item_name: string | null;
  price: number | null;
  is_active: boolean;
}

// ===================================
// Product Group Item Columns (for individual test group pages)
// ===================================
export const createProductGroupItemColumns = (): ColumnDef<ProductGroupItem>[] => [
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
      filterType: "string",
    }
  },
  {
    accessorKey: "seller_sku",
    header: "SKU",
    meta: {
      filterable: true,
      filterType: "string",
    }
  },
  {
    accessorKey: "item_name",
    header: "Product Name",
    cell: ({ row }) => {
      const itemName = row.original.item_name || 'N/A';
      const maxLength = 50;
      const truncatedName = itemName.length > maxLength 
        ? `${itemName.substring(0, maxLength)}...` 
        : itemName;
      
      return (
        <div className="relative group">
          <span className="cursor-default">{truncatedName}</span>
          {itemName.length > maxLength && (
            <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-black text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 max-w-xs whitespace-normal break-words">
              {itemName}
            </div>
          )}
        </div>
      );
    },
    meta: {
      filterable: true,
      filterType: "string",
    }
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.original.price;
      return price !== null ? `$${price.toFixed(2)}` : 'N/A';
    },
    meta: {
      filterable: true,
      filterType: "number",
    }
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        row.original.is_active
          ? "bg-green-100 text-green-800" 
          : "bg-gray-100 text-gray-800"
      }`}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </span>
    ),
    meta: {
      filterable: true,
      filterType: "select",
      filterOptions: ["Active", "Inactive"],
    }
  },
]

// ===================================
// Product Pricing Columns (for Add Test Dialog)
// ===================================
export type ProductPricing = {
  id: string;
  listing_id: string;
  asin: string;
  item_name: string | null;
  price: number | null;
  controlPrice: string;
  testPrice: string;
}

export const createProductPricingColumns = (
  onPriceChange: (productId: string, priceType: 'controlPrice' | 'testPrice', value: string) => void
): ColumnDef<ProductPricing>[] => [
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
      filterType: "string",
    }
  },
  {
    accessorKey: "item_name",
    header: "Product Name",
    cell: ({ row }) => {
      const itemName = row.original.item_name || 'N/A';
      const maxLength = 40; // Adjust this value as needed
      const truncatedName = itemName.length > maxLength 
        ? `${itemName.substring(0, maxLength)}...` 
        : itemName;
      
      return (
        <div className="relative group">
          <span className="cursor-default">{truncatedName}</span>
          {itemName.length > maxLength && (
            <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-black text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 max-w-xs whitespace-normal break-words">
              {itemName}
            </div>
          )}
        </div>
      );
    },
    meta: {
      filterable: true,
      filterType: "string",
    }
  },
  {
    accessorKey: "controlPrice",
    header: "Control Price ($)",
    cell: ({ row }) => (
      <div className="text-right">
        <Input
          type="number"
          value={row.original.controlPrice}
          onChange={(e) => onPriceChange(row.original.id, 'controlPrice', e.target.value)}
          className="text-right rounded-md h-8"
          placeholder="Enter price"
          min="0"
          step="0.01"
        />
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "testPrice",
    header: "Test Price ($)",
    cell: ({ row }) => (
      <div className="text-right">
        <Input
          type="number"
          value={row.original.testPrice}
          onChange={(e) => onPriceChange(row.original.id, 'testPrice', e.target.value)}
          className="text-right rounded-md h-8"
          placeholder="Enter price"
          min="0"
          step="0.01"
        />
      </div>
    ),
    enableSorting: false,
  },
]
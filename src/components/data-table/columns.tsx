import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

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
export type PriceTest = {
  id: string;
  name: string;
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
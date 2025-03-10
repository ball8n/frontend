import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export type Product = {
    id: string;
    sku: string;
    asin: string;
    name: string;
    price: number;
    status: "active" | "inactive";
  }
  
  export const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
    },
    {
      accessorKey: "asin",
      header: "ASIN",
      cell: ({ row }) => (
        <a href={`https://www.amazon.com/dp/${row.original.asin}`} 
           target="_blank" 
           rel="noopener noreferrer"
           className="text-blue-600 hover:underline"
           onClick={(e) => e.stopPropagation()}
        >
          {row.original.asin}
        </a>
      ),
    },
    {
      accessorKey: "name",
      header: "Item Name",
    },
    {
      accessorKey: "price",
      header: "Price",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.status}
        </span>
      ),
    },
  ]
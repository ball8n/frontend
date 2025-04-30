import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export type Product = {
    id: string;
    seller_sku: string;
    asin: string;
    item_name: string;
    price: number;
    status: "Active" | "Inactive";
  }

  export const columns: ColumnDef<Product>[] = [
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
import { ColumnDef } from "@tanstack/react-table"

export type TestGroup = {
    id: string
    name: string
    count: number
    is_active: boolean
  }

export const columns: ColumnDef<TestGroup>[] = [
  {
    accessorKey: "name",
    header: "Group Name",
  },
  {
    accessorKey: "count",
    header: "Number of Items",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        row.original.is_active === true
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
      }`}>
        {row.original.is_active ? "Active" : "Inactive"}
      </span>
    ),
  },
]
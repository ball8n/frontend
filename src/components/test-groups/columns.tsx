import { ColumnDef } from "@tanstack/react-table"

export type TestGroup = {
    id: string
    name: string
    itemCount: number
  }

export const columns: ColumnDef<TestGroup>[] = [
  {
    accessorKey: "name",
    header: "Group Name",
  },
  {
    accessorKey: "itemCount",
    header: "Number of Items",
  },
] 
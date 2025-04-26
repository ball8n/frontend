import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type PriceTest = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "running" | "completed" | "paused" | "planned";
  }
// Helper function to determine badge variant based on status
const getStatusVariant = (status: PriceTest["status"]): "default" | "secondary" | "outline" | "destructive" | "success" => {
  switch(status) {
    case "running":
      return "success" // Use a success variant (assuming you have one defined or use green styling)
    case "completed":
      return "default" // Default badge style
    case "paused":
      return "secondary" // Secondary badge style
    case "planned":
      return "outline" // Outline badge style
    // Add other cases if needed
    default:
      return "default"
  }
}

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString('en-US', { // Or your preferred locale and options
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid Date";
  }
}


export const columns: ColumnDef<PriceTest>[] = [
  {
    accessorKey: "name",
    header: "Price Test Name",
    // Add cell rendering if needed, for example, to make it a link
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => formatDate(row.original.startDate), // Format the date
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => formatDate(row.original.endDate), // Format the date
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusVariant(row.original.status)}>
          {status}
        </Badge>
      )
    },
  },
  // Add more columns if needed, e.g., End Date, Actions, etc.
] 
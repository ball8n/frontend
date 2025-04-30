"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TestGroups, TestGroup } from "@/data/test_groups"
import { PlusCircle } from "lucide-react"

interface DataTableProps {
  data: TestGroup[]
  onAddGroup: () => void
}

/**
 * Displays a searchable and interactive table of test groups with an option to add new groups.
 *
 * Filters groups by name based on user input and shows the number of items in each group. Provides a button to trigger group addition and displays a summary of visible versus total groups.
 *
 * @param data - The list of test groups to display.
 * @param onAddGroup - Callback invoked when the "Add Group" button is clicked.
 */
export function DataTable({ data, onAddGroup }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filter data based on search query
  const filteredData = data.filter((group) => {
    const searchString = searchQuery.toLowerCase()
    return (
      group.name.toLowerCase().includes(searchString)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by group name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button 
          onClick={onAddGroup} 
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Group</span>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Number of Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} groups
      </div>
    </div>
  )
} 
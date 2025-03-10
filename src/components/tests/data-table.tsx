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
import { Test } from "@/data/tests"
import { PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DataTableProps {
  data: Test[]
  onAddTest: () => void
}

export function DataTable({ data, onAddTest }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filter data based on search query
  const filteredData = data.filter((test) => {
    const searchString = searchQuery.toLowerCase()
    return (
      test.name.toLowerCase().includes(searchString)
    )
  })

  // Get status badge color based on status
  const getStatusColor = (status: Test["status"]) => {
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
        return "default"
    }
  }

  // Format date to more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by test name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Button 
          onClick={onAddTest} 
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Test</span>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.name}</TableCell>
                  <TableCell>{formatDate(test.startDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(test.status) as any}>
                      {test.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} tests
      </div>
    </div>
  )
} 
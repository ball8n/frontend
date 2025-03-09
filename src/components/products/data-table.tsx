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
import { Badge } from "@/components/ui/badge"

export type Product = {
  id: string
  sku: string
  asin: string
  name: string
  price: number
  status: "active" | "inactive"
}

interface DataTableProps {
  data: Product[]
}

export function DataTable({ data }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filter data based on search query
  const filteredData = data.filter((product) => {
    const searchString = searchQuery.toLowerCase()
    return (
      product.sku.toLowerCase().includes(searchString) ||
      product.asin.toLowerCase().includes(searchString) ||
      product.name.toLowerCase().includes(searchString)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by SKU, ASIN, or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>ASIN</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>
                    <a 
                      href={`https://www.amazon.de/dp/${product.asin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {product.asin}
                    </a>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>€{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === "active" ? "success" : "secondary"}>
                      {product.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} products
      </div>
    </div>
  )
} 
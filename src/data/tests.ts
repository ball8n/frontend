export type Test = {
  id: string
  name: string
  startDate: string
  status: "running" | "completed" | "paused" | "planned"
}

export const tests: Test[] = [
  {
    id: "1",
    name: "Q1 Price Elasticity Test",
    startDate: "2024-01-15",
    status: "completed"
  },
  {
    id: "2",
    name: "Summer Bundle Promotion",
    startDate: "2024-06-01",
    status: "running"
  },
  {
    id: "3",
    name: "Black Friday Pricing Strategy",
    startDate: "2024-11-20",
    status: "planned"
  },
  {
    id: "4",
    name: "Mobile Accessories Cross-sell",
    startDate: "2024-03-10",
    status: "completed"
  },
  {
    id: "5",
    name: "EU Market Entry Test",
    startDate: "2024-05-01",
    status: "paused"
  },
  {
    id: "6",
    name: "Electronics Category Restructure",
    startDate: "2024-04-15",
    status: "completed"
  },
  {
    id: "7",
    name: "Premium Tier Pricing Test",
    startDate: "2024-07-01",
    status: "planned"
  },
  {
    id: "8",
    name: "Holiday Season Bundles",
    startDate: "2024-12-01",
    status: "planned"
  },
  {
    id: "9",
    name: "Audio Product Line Promotion",
    startDate: "2024-02-10",
    status: "completed"
  },
  {
    id: "10",
    name: "Gaming Peripherals Bundling",
    startDate: "2024-08-15",
    status: "running"
  }
] 
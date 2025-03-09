// Data interfaces for the dashboard
export interface TestData {
  test_group: string;
  test_dates: string[];
  control_dates: string[];
  metrics: DashboardMetrics;
  daily_data_test: DailyDataTest[];
  daily_data_control: DailyDataControl[];
  product_performance: ProductPerformance[];
  order_status: OrderStatus[];
  asin_data: AsinData[];
  test_info: TestInfo;
}

export interface DashboardMetrics {
  total_sales: {
    test: number;
    control: number;
    delta: number;
  };
  total_units: {
    test: number;
    control: number;
    delta: number;
  };
  total_cm: {
    test: number;
    control: number;
    delta: number;
  };
  avg_price: {
    test: number;
    control: number;
    delta: number;
  };
}

export interface DailyDataTest {
  date: string;
  units: number;
  sales: number;
}

export interface DailyDataControl {
  date: string;
  units: number;
  sales: number;
}

export interface ProductPerformance {
  asin: string;
  performance: number;
}

export interface OrderStatus {
  status: string;
  count: number;
}

export interface AsinData {
  asin: string;
  test_units: number;
  control_units: number;
  test_sales: number;
  control_sales: number;
  test_cm: number;
  control_cm: number;
}

export interface TestInfo {
  test_name: string;
  status: string;
  objective: string;
  confidence: number;
  test_period: string;
  control_period: string;
}

// Sample data for the dashboard
export const dashboardData: TestData = {
  test_group: "Blocher Glasses Group",
  test_dates: ["2025-02-01", "2025-02-15"],
  control_dates: ["2025-02-16", "2025-03-01"],
  metrics: {
    total_sales: {
      test: 1103.41,
      control: 1859.5,
      delta: -40.7
    },
    total_units: {
      test: 29,
      control: 50,
      delta: -42
    },
    total_cm: {
      test: 202.11,
      control: 322.42,
      delta: -37.3
    },
    avg_price: {
      test: 41.24,
      control: 38.24,
      delta: 3.00
    }
  },
  daily_data_test: [
    { date: "2025-02-17", units: 1, sales: 35.99 },
    { date: "2025-02-18", units: 2, sales: 71.98 },
    { date: "2025-02-19", units: 2, sales: 85.98 },
    { date: "2025-02-20", units: 4, sales: 140.66 },
    { date: "2025-02-21", units: 0, sales: 0.00 },
    { date: "2025-02-22", units: 2, sales: 78.98 },
    { date: "2025-02-23", units: 2, sales: 78.98},
    { date: "2025-02-24", units: 4, sales: 150.96 },
    { date: "2025-02-25", units: 0, sales: 0.00 },
    { date: "2025-02-26", units: 6, sales: 229.94 },
    { date: "2025-02-27", units: 0, sales: 0.00 },
    { date: "2025-02-28", units: 0, sales: 0.00},
    { date: "2025-03-01", units: 5, sales: 193.95 },
    { date: "2025-02-02", units: 1, sales: 35.99 },
  ],
  daily_data_control: [
    { date: "2025-02-03", units: 5, sales: 192.95 },
    { date: "2025-02-04", units: 1, sales: 39.99 },
    { date: "2025-02-05", units: 2, sales: 72.98 },
    { date: "2025-02-06", units: 6, sales: 225.94 },
    { date: "2025-02-07", units: 3, sales: 112.97 },
    { date: "2025-02-08", units: 4, sales: 159.96 },
    { date: "2025-02-09", units: 5, sales: 185.95 },
    { date: "2025-02-10", units: 6, sales: 211.94 },
    { date: "2025-02-11", units: 2, sales: 65.98 },
    { date: "2025-02-12", units: 3, sales: 119.97 },
    { date: "2025-02-13", units: 5, sales: 178.95 },
    { date: "2025-02-14", units: 2, sales: 72.98 },
    { date: "2025-02-15", units: 3, sales: 112.97 },
    { date: "2025-02-16", units: 3, sales: 105.97 },

  ],
  // product_performance: [
  //   { asin: "B0CCCNRBZK", performance: 33.2 },
  //   { asin: "B0BQRK2Z9S", performance: 26.0 },
  //   { asin: "B0CCCS1JYW", performance: 20.9 },
  //   { asin: "B0CCCSVH8C", performance: 19.8 }
  // ],
  // order_status: [
  //   { status: "Delivered", count: 512 },
  //   { status: "Shipped", count: 95 },
  //   { status: "Processing", count: 45 },
  //   { status: "Cancelled", count: 8 }
  // ],
  asin_data: [
    {
      asin: "B0BQRK2Z9S",
      test_units: 20,
      control_units: 20,
      test_sales: 716.5,
      control_sales: 659.8,
      test_cm: 112.2,
      control_cm: 102.78
    },
    {
      asin: "B0CCCNRBZK",
      test_units: 3,
      control_units: 6,
      test_sales: 128.97,
      control_sales: 239.94,
      test_cm: 31.11,
      control_cm: 49.8
    },
    {
      asin: "B0CCCS1JYW",
      test_units: 2,
      control_units: 15,
      test_sales: 85.98,
      control_sales: 599.85,
      test_cm: 21.6,
      control_cm: 104.76
    },
    {
      asin: "B0CCCSVH8C",
      test_units: 4,
      control_units: 9,
      test_sales: 171.96,
      control_sales: 359.91,
      test_cm: 37.2,
      control_cm: 65.07
    }
  ],
  test_info: {
    test_name: "Blocher Glasses Price Test 1",
    status: "Completed",
    objective: "Determine higher prices for Blocher Glasses improve profits",
    confidence: "??",
    test_period: "Feb 17, 2025 - Mar 02, 2025",
    control_period: "Feb 03, 2025 - Mar 16, 2025"
  }
};

// Function to fetch dashboard data (simulated)
export async function fetchDashboardData(): Promise<TestData> {
  // In a real implementation, this would fetch data from an API
  return new Promise(resolve => {
    setTimeout(() => resolve(dashboardData), 500); // Simulate network delay
  });
} 
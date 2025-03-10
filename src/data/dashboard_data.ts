// Data interfaces for the dashboard
export interface TestData {
  test_group: string;
  metrics: DashboardMetrics;
  daily_data: DailyData[];
  asin_data: AsinData[];
  test_info: TestInfo;
}

export interface DashboardMetrics {
  [key: string]: { // test period key (test1, test2, test3)
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
}

export interface DailyData {
  date: string;
  units: number;
  sales: number;
  test_period: string; // "control", "test1", "test2", etc.
}

export interface AsinData {
  asin: string;
  periods: {
    [key: string]: {
      units: number;
      sales: number;
      cm: number;
    }
  }
}

export interface TestInfo {
  control_period: string;
  tests: {
    [key: string]: {
      name: string;
      status: string;
      objective: string;
      confidence: number;
      period: string;
    }
  }
}

// Sample data for the dashboard
export const dashboardData: TestData = {
  test_group: "Blocher Glasses Group",
  metrics: {
    test1: {
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
    test2: {
      total_sales: {
        test: 1502.35,
        control: 1859.5,
        delta: -19.2
      },
      total_units: {
        test: 38,
        control: 50,
        delta: -24
      },
      total_cm: {
        test: 278.0,
        control: 322.42,
        delta: -13.8
      },
      avg_price: {
        test: 39.53,
        control: 38.24,
        delta: 3.37
      }
    },
    test3: {
      total_sales: {
        test: 1691.6,
        control: 1859.5,
        delta: -9.0
      },
      total_units: {
        test: 44,
        control: 50,
        delta: -12
      },
      total_cm: {
        test: 298.9,
        control: 322.42,
        delta: -7.3
      },
      avg_price: {
        test: 38.45,
        control: 38.24,
        delta: 0.55
      }
    }
  },
  daily_data: [
    // Control Period (Feb 3 - Feb 16)
    { date: "2025-02-03", units: 5, sales: 192.95, test_period: "control" },
    { date: "2025-02-04", units: 1, sales: 39.99, test_period: "control" },
    { date: "2025-02-05", units: 2, sales: 72.98, test_period: "control" },
    { date: "2025-02-06", units: 6, sales: 225.94, test_period: "control" },
    { date: "2025-02-07", units: 3, sales: 112.97, test_period: "control" },
    { date: "2025-02-08", units: 4, sales: 159.96, test_period: "control" },
    { date: "2025-02-09", units: 5, sales: 185.95, test_period: "control" },
    { date: "2025-02-10", units: 6, sales: 211.94, test_period: "control" },
    { date: "2025-02-11", units: 2, sales: 65.98, test_period: "control" },
    { date: "2025-02-12", units: 3, sales: 119.97, test_period: "control" },
    { date: "2025-02-13", units: 5, sales: 178.95, test_period: "control" },
    { date: "2025-02-14", units: 2, sales: 72.98, test_period: "control" },
    { date: "2025-02-15", units: 3, sales: 112.97, test_period: "control" },
    { date: "2025-02-16", units: 3, sales: 105.97, test_period: "control" },

    // Test 1 Period (Feb 17 - Mar 2)
    { date: "2025-02-17", units: 1, sales: 35.99, test_period: "test1" },
    { date: "2025-02-18", units: 2, sales: 71.98, test_period: "test1" },
    { date: "2025-02-19", units: 2, sales: 85.98, test_period: "test1" },
    { date: "2025-02-20", units: 4, sales: 140.66, test_period: "test1" },
    { date: "2025-02-21", units: 0, sales: 0.00, test_period: "test1" },
    { date: "2025-02-22", units: 2, sales: 78.98, test_period: "test1" },
    { date: "2025-02-23", units: 2, sales: 78.98, test_period: "test1" },
    { date: "2025-02-24", units: 4, sales: 150.96, test_period: "test1" },
    { date: "2025-02-25", units: 0, sales: 0.00, test_period: "test1" },
    { date: "2025-02-26", units: 6, sales: 229.94, test_period: "test1" },
    { date: "2025-02-27", units: 0, sales: 0.00, test_period: "test1" },
    { date: "2025-02-28", units: 0, sales: 0.00, test_period: "test1" },
    { date: "2025-03-01", units: 5, sales: 193.95, test_period: "test1" },
    { date: "2025-03-02", units: 1, sales: 35.99, test_period: "test1" },

    // Test 2 Period (Mar 11 - Mar 24)
    { date: "2025-03-11", units: 3, sales: 120.97, test_period: "test2" },
    { date: "2025-03-12", units: 4, sales: 155.96, test_period: "test2" },
    { date: "2025-03-13", units: 2, sales: 82.98, test_period: "test2" },
    { date: "2025-03-14", units: 5, sales: 195.95, test_period: "test2" },
    { date: "2025-03-15", units: 3, sales: 115.97, test_period: "test2" },
    { date: "2025-03-16", units: 1, sales: 45.99, test_period: "test2" },
    { date: "2025-03-17", units: 4, sales: 160.96, test_period: "test2" },
    { date: "2025-03-18", units: 2, sales: 75.98, test_period: "test2" },
    { date: "2025-03-19", units: 3, sales: 125.97, test_period: "test2" },
    { date: "2025-03-20", units: 5, sales: 190.95, test_period: "test2" },
    { date: "2025-03-21", units: 2, sales: 85.98, test_period: "test2" },
    { date: "2025-03-22", units: 4, sales: 165.96, test_period: "test2" },
    { date: "2025-03-23", units: 3, sales: 110.97, test_period: "test2" },
    { date: "2025-03-24", units: 4, sales: 170.96, test_period: "test2" },

    // Test 3 Period (Mar 26 - Apr 9)
    { date: "2025-03-26", units: 5, sales: 200.95, test_period: "test3" },
    { date: "2025-03-27", units: 3, sales: 130.97, test_period: "test3" },
    { date: "2025-03-28", units: 4, sales: 175.96, test_period: "test3" },
    { date: "2025-03-29", units: 2, sales: 90.98, test_period: "test3" },
    { date: "2025-03-30", units: 6, sales: 245.94, test_period: "test3" },
    { date: "2025-03-31", units: 3, sales: 135.97, test_period: "test3" },
    { date: "2025-04-01", units: 4, sales: 180.96, test_period: "test3" },
    { date: "2025-04-02", units: 5, sales: 205.95, test_period: "test3" },
    { date: "2025-04-03", units: 3, sales: 140.97, test_period: "test3" },
    { date: "2025-04-04", units: 4, sales: 185.96, test_period: "test3" },
    { date: "2025-04-05", units: 2, sales: 95.98, test_period: "test3" },
    { date: "2025-04-06", units: 5, sales: 210.95, test_period: "test3" },
    { date: "2025-04-07", units: 3, sales: 145.97, test_period: "test3" },
    { date: "2025-04-08", units: 4, sales: 190.96, test_period: "test3" },
    { date: "2025-04-09", units: 5, sales: 215.95, test_period: "test3" }
  ],
  asin_data: [
    {
      asin: "B0BQRK2Z9S",
      periods: {
        control: {
          units: 20,
          sales: 659.8,
          cm: 102.78
        },
        test1: {
          units: 20,
          sales: 716.5,
          cm: 112.2
        },
        test2: {
          units: 18,
          sales: 680.4,
          cm: 108.5
        },
        test3: {
          units: 22,
          sales: 750.2,
          cm: 115.8
        }
      }
    },
    {
      asin: "B0CCCNRBZK",
      periods: {
        control: {
          units: 6,
          sales: 239.94,
          cm: 49.8
        },
        test1: {
          units: 3,
          sales: 128.97,
          cm: 31.11
        },
        test2: {
          units: 5,
          sales: 210.5,
          cm: 45.2
        },
        test3: {
          units: 4,
          sales: 175.6,
          cm: 38.4
        }
      }
    },
    {
      asin: "B0CCCS1JYW",
      periods: {
        control: {
          units: 15,
          sales: 599.85,
          cm: 104.76
        },
        test1: {
          units: 2,
          sales: 85.98,
          cm: 21.6
        },
        test2: {
          units: 8,
          sales: 320.4,
          cm: 68.5
        },
        test3: {
          units: 10,
          sales: 425.6,
          cm: 82.3
        }
      }
    },
    {
      asin: "B0CCCSVH8C",
      periods: {
        control: {
          units: 9,
          sales: 359.91,
          cm: 65.07
        },
        test1: {
          units: 4,
          sales: 171.96,
          cm: 37.2
        },
        test2: {
          units: 7,
          sales: 290.5,
          cm: 55.8
        },
        test3: {
          units: 8,
          sales: 340.2,
          cm: 62.4
        }
      }
    }
  ],
  test_info: {
    control_period: "Feb 03, 2025 - Feb 16, 2025",
    tests: {
      test1: {
        name: "Blocher Glasses Price Test 1",
        status: "Completed",
        objective: "Determine higher prices for Blocher Glasses improve profits",
        confidence: 95,
        period: "Feb 17, 2025 - Mar 02, 2025"
      },
      test2: {
        name: "Blocher Glasses Price Test 2",
        status: "Completed",
        objective: "Validate price elasticity with adjusted pricing strategy",
        confidence: 92,
        period: "Mar 11, 2025 - Mar 24, 2025"
      },
      test3: {
        name: "Blocher Glasses Price Test 3",
        status: "In Progress",
        objective: "Fine-tune pricing strategy based on previous test results",
        confidence: 88,
        period: "Mar 26, 2025 - Apr 09, 2025"
      }
    }
  }
};

// Function to fetch dashboard data (simulated)
export async function fetchDashboardData(): Promise<TestData> {
  // In a real implementation, this would fetch data from an API
  return new Promise(resolve => {
    setTimeout(() => resolve(dashboardData), 500); // Simulate network delay
  });
} 
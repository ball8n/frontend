'use client';

import { DashboardMetrics } from '@/data/dashboard_data';
// MetricsCards expects a single metrics object, not the entire mapping
type SingleMetrics = DashboardMetrics[string];
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  metrics: SingleMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Units Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Units</CardTitle>
          <DeltaIndicator value={metrics.total_units.delta} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total_units.test}</div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {metrics.total_units.control} (control)
          </p>
        </CardContent>
      </Card>

      {/* Total Sales Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DeltaIndicator value={metrics.total_sales.delta} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.total_sales.test)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {formatCurrency(metrics.total_sales.control)} (control)
          </p>
        </CardContent>
      </Card>

      {/* Contribution Margin Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contribution Margin</CardTitle>
          <DeltaIndicator value={metrics.total_cm.delta} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.total_cm.test)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            vs {formatCurrency(metrics.total_cm.control)} (control)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface DeltaIndicatorProps {
  value: number;
}

function DeltaIndicator({ value }: DeltaIndicatorProps) {
  const isPositive = value > 0;
  
  return (
    <div className={cn(
      "flex items-center rounded-md px-2 py-1 text-xs font-medium",
      isPositive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400" : 
                   "bg-rose-100 text-rose-800 dark:bg-rose-800/20 dark:text-rose-400"
    )}>
      {isPositive ? (
        <ArrowUpIcon className="mr-1 h-3 w-3" />
      ) : (
        <ArrowDownIcon className="mr-1 h-3 w-3" />
      )}
      {Math.abs(value).toFixed(1)}%
    </div>
  );
} 
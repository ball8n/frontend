'use client';

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { DailyData } from '@/data/dashboard_data';
import { format, parseISO } from 'date-fns';

interface DailyComparisonChartProps {
  data: DailyData[];
  metric: 'units' | 'sales';
  testDates: string[];
  controlDates: string[];
}

export default function DailyComparisonChart({ 
  data, 
  metric, 
  testDates, 
  controlDates 
}: DailyComparisonChartProps) {
  // Format the data for the chart
  const chartData = useMemo(() => {
    return data.map(day => ({
      date: format(parseISO(day.date), 'MMM d'),
      testValue: metric === 'units' ? day.test_units : day.test_sales,
      controlValue: metric === 'units' ? day.control_units : day.control_sales,
    }));
  }, [data, metric]);

  // Calculate Y-axis domain based on max value
  const maxValue = useMemo(() => {
    const values = chartData.flatMap(day => [day.testValue, day.controlValue]);
    return Math.max(...values) * 1.1; // Add 10% padding
  }, [chartData]);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs fill-muted-foreground" 
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            domain={[0, maxValue]} 
            width={60}
            tickFormatter={(value) => {
              if (metric === 'sales') {
                return `€${value}`;
              }
              return value.toString();
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))' 
            }}
            formatter={(value, name) => {
              const formattedValue = metric === 'sales' ? `€${value}` : value;
              return [formattedValue, name === 'testValue' ? 'Test' : 'Control'];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend 
            formatter={(value) => (value === 'testValue' ? 'Test Period' : 'Control Period')}
          />
          <Line
            type="monotone"
            dataKey="testValue"
            name="testValue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="controlValue"
            name="controlValue"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ProductPerformance } from '@/data/dashboard_data';

interface ProductPerformanceChartProps {
  data: ProductPerformance[];
}

export default function ProductPerformanceChart({ data }: ProductPerformanceChartProps) {
  // Define colors based on shadcn theme
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--destructive))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
  ];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={60}
            dataKey="performance"
            nameKey="asin"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="stroke-background hover:opacity-80 transition-opacity duration-200"
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Performance']}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))' 
            }}
          />
          <Legend 
            layout="vertical" 
            align="right"
            verticalAlign="middle"
            formatter={(value) => value}
            className="text-xs fill-muted-foreground"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 
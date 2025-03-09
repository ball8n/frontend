"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dashboardData } from "@/data/dashboard_data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Sector } from 'recharts';

export default function Dashboard() {
  const [comparisonMetric, setComparisonMetric] = useState<"units" | "sales">("units");
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  const data = dashboardData;

  // Calculate total units for test and control periods
  const totalTestUnits = data.asin_data.reduce((sum, item) => sum + item.test_units, 0);
  const totalControlUnits = data.asin_data.reduce((sum, item) => sum + item.control_units, 0);

  // Prepare data for pie charts
  const testPieData = data.asin_data.map((item) => ({
    name: item.asin,
    value: item.test_units,
    percentage: ((item.test_units / totalTestUnits) * 100).toFixed(1)
  }));

  const controlPieData = data.asin_data.map((item) => ({
    name: item.asin,
    value: item.control_units,
    percentage: ((item.control_units / totalControlUnits) * 100).toFixed(1)
  }));

  // ASIN color scheme - consistent across both charts
  const ASIN_COLORS = [
    "#8dd3c7",
    "#bebada",
    "#fb8072",
    "#80b1d3",
    "#fdb462",
    "#b3de69",
    "#fccde5",
    "#d9d9d9"
  ];

  // Custom active shape for pie chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>{payload.name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
          {`${value} units (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Test Info */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Group:</p>
              <p className="text-sm text-muted-foreground">{data.test_group}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Number of ASINs:</p>
              <p className="text-sm text-muted-foreground">{data.asin_data.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Test Name:</p>
              <p className="text-sm text-muted-foreground">{data.test_info.test_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status:</p>
              <p className="text-sm text-muted-foreground">{data.test_info.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Objective:</p>
              <p className="text-sm text-muted-foreground">{data.test_info.objective}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Confidence:</p>
              <p className="text-sm text-muted-foreground">{data.test_info.confidence}%</p>
            </div>
            <div>
              <p className="text-sm font-medium">Test Period:</p>
              <p className="text-sm text-muted-foreground">{data.test_info.test_period}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Control Period:</p>
              <p className="text-sm text-muted-foreground">{data.test_info.control_period}</p>
            </div>
          </div>
          
          {/* ASIN List */}
          <div className="mt-2">
            <p className="text-sm font-medium mb-2">ASINs in Group:</p>
            <div className="grid grid-cols-4 gap-2">
              {data.asin_data.map((item, index) => (
                <div key={index} className="text-sm text-muted-foreground px-2 py-1">
                  <a 
                    href={`https://www.amazon.de/dp/${item.asin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 hover:underline"
                  >
                    {item.asin}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Units Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <div className={`flex items-center rounded-md px-2 py-1 text-xs font-medium ${data.metrics.total_units.delta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {data.metrics.total_units.delta > 0 ? '+' : ''}{data.metrics.total_units.delta.toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.total_units.test}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {data.metrics.total_units.control} (control)
            </p>
          </CardContent>
        </Card>
        {/* Total Sales Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <div className={`flex items-center rounded-md px-2 py-1 text-xs font-medium ${data.metrics.total_sales.delta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {data.metrics.total_sales.delta > 0 ? '+' : ''}{data.metrics.total_sales.delta.toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.metrics.total_sales.test}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs €{data.metrics.total_sales.control} (control)
            </p>
          </CardContent>
        </Card>

        {/* Contribution Margin Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribution Margin</CardTitle>
            <div className={`flex items-center rounded-md px-2 py-1 text-xs font-medium ${data.metrics.total_cm.delta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {data.metrics.total_cm.delta > 0 ? '+' : ''}{data.metrics.total_cm.delta.toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.metrics.total_cm.test}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs €{data.metrics.total_cm.control} (control)
            </p>
          </CardContent>
        </Card>

        {/* Average Price Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <div className={`flex items-center rounded-md px-2 py-1 text-xs font-medium ${data.metrics.avg_price.delta > 0 ? 'bg-emerald-100 text-emerald-800' : data.metrics.avg_price.delta < 0 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
              {data.metrics.avg_price.delta > 0 ? '+' : ''}{data.metrics.avg_price.delta.toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.metrics.avg_price.test.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs €{data.metrics.avg_price.control.toFixed(2)} (control)
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Daily Comparison Test vs Control */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Comparison Test vs Control</CardTitle>
          <CardDescription>Compare test vs control sales over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end space-x-2 mb-4">
            <Select
              value={comparisonMetric}
              onValueChange={(value) => setComparisonMetric(value as "units" | "sales")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="units">Units</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="h-[400px] w-full flex flex-col items-center justify-center bg-white rounded-md p-4 border border-gray-200">
            <div className="w-full text-center mb-4 font-medium">
              {comparisonMetric === "units" 
                ? "Daily Units Comparison Chart" 
                : "Daily Sales Comparison Chart"}
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  allowDuplicatedCategory={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => comparisonMetric === "sales" ? `€${value}` : value}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return `${date.toLocaleDateString()}`;
                  }}
                />
                <Legend />
                <Line 
                  name="Control Period" 
                  data={data.daily_data_control} 
                  dataKey={comparisonMetric === "units" ? "units" : "sales"} 
                  stroke="#DD8452" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  name="Test Period" 
                  data={data.daily_data_test} 
                  dataKey={comparisonMetric === "units" ? "units" : "sales"} 
                  stroke="#4C72B0" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                
              </LineChart>
            </ResponsiveContainer>
            
            <p className="text-xs text-muted-foreground mt-4">
              Comparing {comparisonMetric} between test period ({data.test_info.test_period}) and control period ({data.test_info.control_period})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metric Comparison Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Units Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <CardDescription>Test vs Control</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { name: 'Test', value: data.metrics.total_units.test },
                  { name: 'Control', value: data.metrics.total_units.control }
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis 
                  type="number"
                  label={{ 
                    value: 'Units Sold', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' },
                    offset: -5,
                    dx: -30
                  }}
                />
                <Tooltip formatter={(value) => value} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <Cell fill="#4C72B0" />
                  <Cell fill="#DD8452" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-muted-foreground mt-2">
              Delta: {data.metrics.total_units.delta > 0 ? '+' : ''}{data.metrics.total_units.delta.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        {/* Total Sales Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CardDescription>Test vs Control</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { name: 'Test', value: data.metrics.total_sales.test },
                  { name: 'Control', value: data.metrics.total_sales.control }
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis 
                  type="number"
                  label={{ 
                    value: 'Sales (€)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' },
                    offset: -5,
                    dx: -30
                  }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip formatter={(value) => `€${value}`} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <Cell fill="#4C72B0" />
                  <Cell fill="#DD8452" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-muted-foreground mt-2">
              Delta: {data.metrics.total_sales.delta > 0 ? '+' : ''}{data.metrics.total_sales.delta.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        {/* Contribution Margin Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contribution Margin</CardTitle>
            <CardDescription>Test vs Control</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { name: 'Test', value: data.metrics.total_cm.test },
                  { name: 'Control', value: data.metrics.total_cm.control }
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis 
                  type="number"
                  label={{ 
                    value: 'Contribution Margin', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' },
                    offset: -5,
                    dx: -30
                  }}
                />
                <Tooltip formatter={(value) => `€${value}`} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <Cell fill="#4C72B0" />
                  <Cell fill="#DD8452" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-muted-foreground mt-2">
              Delta: {data.metrics.total_cm.delta > 0 ? '+' : ''}{data.metrics.total_cm.delta.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ASIN Distribution Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Test Period ASIN Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Test Period ASIN Distribution</CardTitle>
            <CardDescription>Share of each ASIN in total units sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    activeIndex={activeTestIndex}
                    activeShape={renderActiveShape}
                    data={testPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#4C72B0"
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveTestIndex(index)}
                  >
                    {testPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ASIN_COLORS[index % ASIN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} units (${props.payload.percentage}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center text-xs text-muted-foreground">
                Total: {totalTestUnits} units
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Period ASIN Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Control Period ASIN Distribution</CardTitle>
            <CardDescription>Share of each ASIN in total units sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    activeIndex={activeControlIndex}
                    activeShape={renderActiveShape}
                    data={controlPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#DD8452"
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveControlIndex(index)}
                  >
                    {controlPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ASIN_COLORS[index % ASIN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} units (${props.payload.percentage}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center text-xs text-muted-foreground">
                Total: {totalControlUnits} units
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ASIN Units Comparison Bar Chart */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">ASIN Units Comparison</CardTitle>
          <CardDescription>Test vs Control period units sold by ASIN</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.asin_data.map(item => ({
                  asin: item.asin,
                  test: item.test_units,
                  control: item.control_units,
                  testColor: "#4C72B0",
                  controlColor: "#DD8452"
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="asin" 
                  height={50}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text 
                          x={0} 
                          y={0} 
                          dy={16} 
                          textAnchor="middle" 
                          fill="#666" 
                          fontSize={12}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis 
                  type="number"
                  label={{ 
                    value: 'Units Sold', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' },
                    offset: -5,
                    dx: -30
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} units`, 
                    name === 'test' ? 'Test Period' : 'Control Period'
                  ]}
                  labelFormatter={(label) => `ASIN: ${label}`}
                />
                <Legend 
                  verticalAlign="top" 
                  wrapperStyle={{ paddingBottom: 10 }}
                  payload={[
                    { value: 'Test Period', type: 'square', color: '#4C72B0' },
                    { value: 'Control Period', type: 'square', color: '#DD8452' }
                  ]}
                />
                <Bar 
                  dataKey="test" 
                  name="Test Period" 
                  fill="#4C72B0" 
                  barSize={30}
                />
                <Bar 
                  dataKey="control" 
                  name="Control Period" 
                  fill="#DD8452" 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Compare the number of units sold for each ASIN between test period ({data.test_info.test_period}) and control period ({data.test_info.control_period})
          </div>
        </CardContent>
      </Card>

      {/* ASIN Sales Comparison Bar Chart */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">ASIN Sales Comparison</CardTitle>
          <CardDescription>Test vs Control period sales (revenue) by ASIN</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.asin_data.map(item => ({
                  asin: item.asin,
                  test: item.test_sales,
                  control: item.control_sales,
                  testColor: "#4C72B0",
                  controlColor: "#DD8452"
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="asin" 
                  height={50}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text 
                          x={0} 
                          y={0} 
                          dy={16} 
                          textAnchor="middle" 
                          fill="#666" 
                          fontSize={12}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis 
                  type="number"
                  label={{ 
                    value: 'Sales (€)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' },
                    offset: -5,
                    dx: -30
                  }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `€${value}`, 
                    name === 'test' ? 'Test Period' : 'Control Period'
                  ]}
                  labelFormatter={(label) => `ASIN: ${label}`}
                />
                <Legend 
                  verticalAlign="top" 
                  wrapperStyle={{ paddingBottom: 10 }}
                  payload={[
                    { value: 'Test Period', type: 'square', color: '#4C72B0' },
                    { value: 'Control Period', type: 'square', color: '#DD8452' }
                  ]}
                />
                <Bar 
                  dataKey="test" 
                  name="Test Period" 
                  fill="#4C72B0" 
                  barSize={30}
                />
                <Bar 
                  dataKey="control" 
                  name="Control Period" 
                  fill="#DD8452" 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Compare the sales revenue for each ASIN between test period ({data.test_info.test_period}) and control period ({data.test_info.control_period})
          </div>
        </CardContent>
      </Card>

      {/* ASIN Contribution Margin Comparison Bar Chart */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">ASIN Contribution Margin Comparison</CardTitle>
          <CardDescription>Test vs Control period contribution margin by ASIN</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.asin_data.map(item => ({
                  asin: item.asin,
                  test: item.test_cm,
                  control: item.control_cm,
                  testColor: "#4C72B0",
                  controlColor: "#DD8452"
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="asin" 
                  height={50}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text 
                          x={0} 
                          y={0} 
                          dy={16} 
                          textAnchor="middle" 
                          fill="#666" 
                          fontSize={12}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis 
                  type="number"
                  label={{ 
                    value: 'Contribution Margin (€)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' },
                    offset: -5,
                    dx: -30
                  }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `€${value}`, 
                    name === 'test' ? 'Test Period' : 'Control Period'
                  ]}
                  labelFormatter={(label) => `ASIN: ${label}`}
                />
                <Legend 
                  verticalAlign="top" 
                  wrapperStyle={{ paddingBottom: 10 }}
                  payload={[
                    { value: 'Test Period', type: 'square', color: '#4C72B0' },
                    { value: 'Control Period', type: 'square', color: '#DD8452' }
                  ]}
                />
                <Bar 
                  dataKey="test" 
                  name="Test Period" 
                  fill="#4C72B0" 
                  barSize={30}
                />
                <Bar 
                  dataKey="control" 
                  name="Control Period" 
                  fill="#DD8452" 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Compare the contribution margin for each ASIN between test period ({data.test_info.test_period}) and control period ({data.test_info.control_period})
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
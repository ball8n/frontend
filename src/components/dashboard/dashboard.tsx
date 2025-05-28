"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { dashboardData } from "@/data/dashboard_data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Sector } from 'recharts';
import { fetchTestGroupById } from "@/lib/api";
import { ProductGroupInfo } from "@/components/data-table/columns";

interface DashboardProps {
  groupId: string;
}

// Consistent color mapping for test periods - use the same color for the same test period regardless of selection
const TEST_PERIOD_COLORS: Record<string, string> = {
  "test1": "#4C72B0", // blue
  "test2": "#55A868", // green
  "test3": "#C44E52", // red
  // Add more colors if needed for additional test periods
};

// Control period color
const CONTROL_COLOR = "#DD8452"; // orange

// Color palette for ASINs
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

export default function Dashboard({ groupId }: DashboardProps) {
  const [comparisonMetric, setComparisonMetric] = useState<"units" | "sales">("units");
  const [selectedTestPeriods, setSelectedTestPeriods] = useState<string[]>(["test1"]);
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  const [groupInfo, setGroupInfo] = useState<ProductGroupInfo | null>(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState<string | null>(null);
  const data = dashboardData;

  // Fetch group information when groupId changes
  useEffect(() => {
    const loadGroupInfo = async () => {
      if (!groupId) return;
      
      setGroupLoading(true);
      setGroupError(null);
      try {
        const info = await fetchTestGroupById(groupId);
        setGroupInfo(info);
      } catch (err) {
        console.error('Failed to fetch group info:', err);
        setGroupError(err instanceof Error ? err.message : 'Failed to load group information');
      } finally {
        setGroupLoading(false);
      }
    };

    loadGroupInfo();
  }, [groupId]);

  // Helper function to get color for a test period
  const getTestPeriodColor = (period: string): string => {
    return TEST_PERIOD_COLORS[period] || "#4C72B0"; // Default to blue if not found
  };

  // Filter data for the control and selected test periods
  const controlData = data.daily_data.filter(item => item.test_period === "control");
  
  // Get all test periods directly from test_info.tests object
  const testPeriods = Object.keys(data.test_info.tests);
  
  // Toggle a test period selection
  const toggleTestPeriod = (period: string) => {
    setSelectedTestPeriods(prev => {
      if (prev.includes(period)) {
        // Don't allow deselecting the last period
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== period);
      } else {
        // Limit to maximum 3 test periods
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, period];
      }
    });
  };

  // Calculate total units for control period
  const totalControlUnits = controlData.reduce((sum, item) => sum + item.units, 0);

  // Prepare data for pie charts - we'll just use the first selected period for the pie chart
  const primarySelectedPeriod = selectedTestPeriods[0];
  const testDataForPieChart = data.daily_data.filter(item => item.test_period === primarySelectedPeriod);
  const totalTestUnits = testDataForPieChart.reduce((sum, item) => sum + item.units, 0);

  const testPieData = data.asin_data.map((item) => ({
    name: item.asin,
    value: item.periods[primarySelectedPeriod].units,
    percentage: ((item.periods[primarySelectedPeriod].units / totalTestUnits) * 100).toFixed(1)
  }));

  const controlPieData = data.asin_data.map((item) => ({
    name: item.asin,
    value: item.periods.control.units,
    percentage: ((item.periods.control.units / totalControlUnits) * 100).toFixed(1)
  }));

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
      {/* Group Info */}
      <Card>
        <CardHeader>
          <CardTitle>Group Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {groupLoading ? (
            <div className="text-sm text-muted-foreground">Loading group information...</div>
          ) : groupError ? (
            <div className="text-sm text-red-500">Error: {groupError}</div>
          ) : groupInfo ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Group:</p>
                  <p className="text-sm text-muted-foreground">{groupInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Number of ASINs:</p>
                  <p className="text-sm text-muted-foreground">{groupInfo.items.filter(item => item.is_active).length}</p>
                </div>
              </div>
              
              {/* ASIN List */}
              <div className="mt-2">
                <p className="text-sm font-medium mb-2">ASINs in Group:</p>
                <div className="grid grid-cols-4 gap-2">
                  {groupInfo.items
                    .filter(item => item.is_active)
                    .map((item) => (
                    <div key={item.id} className="text-sm text-muted-foreground px-2 py-1">
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
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No group information available</div>
          )}
        </CardContent>
      </Card>

      {/* Test Details Cards with Selection Checkboxes */}
      <Card>
        <CardHeader>
          <CardTitle>Test Period Selection</CardTitle>
          <CardDescription>Select multiple test periods to compare on the charts (max 3)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${
            testPeriods.length <= 3 ? 'md:grid-cols-3' : 
            testPeriods.length === 4 ? 'md:grid-cols-4' : 
            'md:grid-cols-5'
          }`}>
            {testPeriods.map((period, index) => (
              <Card key={period} className={`border-l-4 ${selectedTestPeriods.includes(period) ? `border-l-[${getTestPeriodColor(period)}] bg-opacity-10 bg-[${getTestPeriodColor(period)}]` : 'border-l-gray-200'}`}>
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{data.test_info.tests[period].name}</CardTitle>
                    <CardDescription className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        data.test_info.tests[period].status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : data.test_info.tests[period].status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {data.test_info.tests[period].status}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center h-5">
                    <Checkbox 
                      id={`test-${period}`} 
                      checked={selectedTestPeriods.includes(period)}
                      onCheckedChange={() => toggleTestPeriod(period)}
                      disabled={
                        (selectedTestPeriods.includes(period) && selectedTestPeriods.length === 1) || 
                        (!selectedTestPeriods.includes(period) && selectedTestPeriods.length >= 3)
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 text-xs space-y-1">
                  <div>
                    <span className="font-medium">Period:</span> {data.test_info.tests[period].period}
                  </div>
                  <div>
                    <span className="font-medium">Objective:</span> {data.test_info.tests[period].objective}
                  </div>
                  <div>
                    <span className="font-medium">Confidence:</span> {data.test_info.tests[period].confidence}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Metrics Cards */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Test Metrics Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {selectedTestPeriods.map(testPeriod => {
            // Calculate column span based on number of selected periods
            const colSpan = selectedTestPeriods.length === 1 ? "md:col-span-12" : 
                           selectedTestPeriods.length === 2 ? "md:col-span-6" : 
                           "md:col-span-4";
            
            return (
              <div key={`metrics-${testPeriod}`} className={`${colSpan}`}>
                <Card>
                  <CardHeader className="pb-2" style={{ borderBottom: `2px solid ${getTestPeriodColor(testPeriod)}` }}>
                    <CardTitle>{data.test_info.tests[testPeriod].name}</CardTitle>
                    <CardDescription>Comparison against control period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid ${selectedTestPeriods.length === 1 ? 'grid-cols-4' : 'grid-cols-2'} gap-3 my-3`}>
                      {/* Total Units Card */}
                      <div className="p-3 border rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">Total Units</p>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            data.metrics[testPeriod].total_units.delta >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {data.metrics[testPeriod].total_units.delta >= 0 ? '+' : ''}
                            {data.metrics[testPeriod].total_units.delta.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xl font-bold">
                          {data.metrics[testPeriod].total_units.test}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          vs {data.metrics[testPeriod].total_units.control} (control)
                        </p>
                      </div>

                      {/* Total Sales Card */}
                      <div className="p-3 border rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">Total Sales</p>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            data.metrics[testPeriod].total_sales.delta >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {data.metrics[testPeriod].total_sales.delta >= 0 ? '+' : ''}
                            {data.metrics[testPeriod].total_sales.delta.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xl font-bold">
                          €{data.metrics[testPeriod].total_sales.test.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          vs €{data.metrics[testPeriod].total_sales.control.toFixed(2)} (control)
                        </p>
                      </div>

                      {/* Contribution Margin Card */}
                      <div className="p-3 border rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">Contribution Margin</p>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            data.metrics[testPeriod].total_cm.delta >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {data.metrics[testPeriod].total_cm.delta >= 0 ? '+' : ''}
                            {data.metrics[testPeriod].total_cm.delta.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xl font-bold">
                          €{data.metrics[testPeriod].total_cm.test.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          vs €{data.metrics[testPeriod].total_cm.control.toFixed(2)} (control)
                        </p>
                      </div>

                      {/* Average Price Card */}
                      <div className="p-3 border rounded-md">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">Average Price</p>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            data.metrics[testPeriod].avg_price.delta >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {data.metrics[testPeriod].avg_price.delta >= 0 ? '+' : ''}
                            {data.metrics[testPeriod].avg_price.delta.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xl font-bold">
                          €{data.metrics[testPeriod].avg_price.test.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          vs €{data.metrics[testPeriod].avg_price.control.toFixed(2)} (control)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Comparison Chart</CardTitle>
          <CardDescription>Compare control vs test periods over time</CardDescription>
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
                
                {/* Control Period Line */}
                <Line 
                  name="Control Period" 
                  data={controlData} 
                  dataKey={comparisonMetric}
                  stroke={CONTROL_COLOR} 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />

                {/* Test Period Lines */}
                {selectedTestPeriods.map((period) => {
                  const testData = data.daily_data.filter(item => item.test_period === period);
                  return (
                    <Line 
                      key={period}
                      name={`${data.test_info.tests[period].name}`}
                      data={testData} 
                      dataKey={comparisonMetric}
                      stroke={getTestPeriodColor(period)}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
            
            <p className="text-xs text-muted-foreground mt-4">
              Comparing {comparisonMetric} between selected test periods and control period ({data.test_info.control_period})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bar Charts Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Units Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { 
                    name: 'Control',
                    value: data.metrics[primarySelectedPeriod].total_units.control,
                    fill: CONTROL_COLOR
                  },
                  ...selectedTestPeriods.map((period) => ({
                    name: `Test ${period.replace('test', '')}`,
                    value: data.metrics[period].total_units.test,
                    fill: getTestPeriodColor(period)
                  }))
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => value} />
                <Bar dataKey="value" fill="#8884d8" name="Units" isAnimationActive={false}>
                  {
                    ([
                      { 
                        name: 'Control',
                        value: data.metrics[primarySelectedPeriod].total_units.control,
                        fill: CONTROL_COLOR
                      },
                      ...selectedTestPeriods.map((period) => ({
                        name: `Test ${period.replace('test', '')}`,
                        value: data.metrics[period].total_units.test,
                        fill: getTestPeriodColor(period)
                      }))
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    )))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Sales (€)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { 
                    name: 'Control',
                    value: data.metrics[primarySelectedPeriod].total_sales.control,
                    fill: CONTROL_COLOR
                  },
                  ...selectedTestPeriods.map((period) => ({
                    name: `Test ${period.replace('test', '')}`,
                    value: data.metrics[period].total_sales.test,
                    fill: getTestPeriodColor(period)
                  }))
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}`} />
                <Bar dataKey="value" fill="#8884d8" name="Sales" isAnimationActive={false}>
                  {
                    ([
                      { 
                        name: 'Control',
                        value: data.metrics[primarySelectedPeriod].total_sales.control,
                        fill: CONTROL_COLOR
                      },
                      ...selectedTestPeriods.map((period) => ({
                        name: `Test ${period.replace('test', '')}`,
                        value: data.metrics[period].total_sales.test,
                        fill: getTestPeriodColor(period)
                      }))
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    )))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contribution Margin Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Contribution Margin (€)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { 
                    name: 'Control',
                    value: data.metrics[primarySelectedPeriod].total_cm.control,
                    fill: CONTROL_COLOR
                  },
                  ...selectedTestPeriods.map((period) => ({
                    name: `Test ${period.replace('test', '')}`,
                    value: data.metrics[period].total_cm.test,
                    fill: getTestPeriodColor(period)
                  }))
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}`} />
                <Bar dataKey="value" fill="#8884d8" name="CM" isAnimationActive={false}>
                  {
                    ([
                      { 
                        name: 'Control',
                        value: data.metrics[primarySelectedPeriod].total_cm.control,
                        fill: CONTROL_COLOR
                      },
                      ...selectedTestPeriods.map((period) => ({
                        name: `Test ${period.replace('test', '')}`,
                        value: data.metrics[period].total_cm.test,
                        fill: getTestPeriodColor(period)
                      }))
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    )))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ASIN Distribution Section - Individual Pie Chart Cards */}
      <h2 className="text-xl font-bold mt-6 mb-4">ASIN Distribution by Units</h2>
      
      {(() => {
        // Calculate the grid layout based on the number of cards
        const totalCards = 1 + selectedTestPeriods.length; // Control + test periods
        let colSpan;
        
        // Calculate column span for each card
        if (totalCards <= 2) {
          colSpan = "md:col-span-6"; // 2 cards per row on medium screens
        } else if (totalCards === 3) {
          colSpan = "md:col-span-4"; // 3 cards per row on medium screens
        } else {
          colSpan = "md:col-span-3"; // 4 cards per row on medium screens
        }
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Control Period Pie Chart */}
            <Card className={colSpan}>
              <CardHeader className="pb-2" style={{ borderBottom: `2px solid ${CONTROL_COLOR}` }}>
                <CardTitle className="text-lg">Control Period</CardTitle>
                <CardDescription>Units distribution across ASINs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        activeIndex={activeControlIndex}
                        activeShape={renderActiveShape}
                        data={controlPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveControlIndex(index)}
                      >
                        {controlPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ASIN_COLORS[index % ASIN_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value} units`}
                        labelFormatter={(name) => `ASIN: ${name}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-xs text-muted-foreground mt-2">
                  Total: {totalControlUnits} units
                </div>
              </CardContent>
            </Card>

            {/* Test Period Pie Charts - One card for each selected test period */}
            {selectedTestPeriods.map((period, periodIndex) => {
              // Calculate total units for this test period
              const periodData = data.daily_data.filter(item => item.test_period === period);
              const totalUnits = periodData.reduce((sum, item) => sum + item.units, 0);
              
              // Prepare pie data for this test period
              const periodPieData = data.asin_data.map((item) => ({
                name: item.asin,
                value: item.periods[period].units,
                percentage: ((item.periods[period].units / totalUnits) * 100).toFixed(1)
              }));

              return (
                <Card key={period} className={colSpan}>
                  <CardHeader className="pb-2" style={{ borderBottom: `2px solid ${getTestPeriodColor(period)}` }}>
                    <CardTitle className="text-lg">{data.test_info.tests[period].name}</CardTitle>
                    <CardDescription>Units distribution across ASINs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            activeIndex={activeControlIndex}
                            activeShape={renderActiveShape}
                            data={periodPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {periodPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={ASIN_COLORS[index % ASIN_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `${value} units`}
                            labelFormatter={(name) => `ASIN: ${name}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center text-xs text-muted-foreground mt-2">
                      Total: {totalUnits} units
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })()}

      {/* ASIN Unit Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>ASIN Units Comparison</CardTitle>
          <CardDescription>
            Unit sales by ASIN comparison between test and control periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.asin_data.map(item => ({
                  asin: item.asin,
                  ...selectedTestPeriods.reduce((acc, period) => {
                    acc[period] = item.periods[period].units;
                    return acc;
                  }, {} as Record<string, number>),
                  control: item.periods.control.units
                }))}
                margin={{ top: 20, right: 30, left: 30, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="asin" 
                  type="category"
                  height={70}
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
                <YAxis type="number" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'control') return [`${value} units`, 'Control'];
                    return [`${value} units`, data.test_info.tests[name as string].name];
                  }}
                  labelFormatter={(label) => `ASIN: ${label}`}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'control') return 'Control';
                    return data.test_info.tests[value as string].name;
                  }}
                />
                <Bar dataKey="control" name="control" fill={CONTROL_COLOR} />
                {selectedTestPeriods.map((period) => (
                  <Bar 
                    key={period} 
                    dataKey={period} 
                    name={period} 
                    fill={getTestPeriodColor(period)} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Compare units sold for each ASIN between selected test periods and control
          </div>
        </CardContent>
      </Card>

      {/* ASIN Sales Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>ASIN Sales Comparison</CardTitle>
          <CardDescription>
            Sales revenue by ASIN comparison between test and control periods (€)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.asin_data.map(item => ({
                  asin: item.asin,
                  ...selectedTestPeriods.reduce((acc, period) => {
                    acc[period] = item.periods[period].sales;
                    return acc;
                  }, {} as Record<string, number>),
                  control: item.periods.control.sales
                }))}
                margin={{ top: 20, right: 30, left: 30, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="asin" 
                  type="category"
                  height={70}
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
                <YAxis type="number" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'control') return [`€${value}`, 'Control'];
                    return [`€${value}`, data.test_info.tests[name as string].name];
                  }}
                  labelFormatter={(label) => `ASIN: ${label}`}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'control') return 'Control';
                    return data.test_info.tests[value as string].name;
                  }}
                />
                <Bar dataKey="control" name="control" fill={CONTROL_COLOR} />
                {selectedTestPeriods.map((period) => (
                  <Bar 
                    key={period} 
                    dataKey={period} 
                    name={period} 
                    fill={getTestPeriodColor(period)} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Compare sales revenue for each ASIN between selected test periods and control
          </div>
        </CardContent>
      </Card>

      {/* ASIN Contribution Margin Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>ASIN Contribution Margin Comparison</CardTitle>
          <CardDescription>
            Contribution margin by ASIN comparison between test and control periods (€)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.asin_data.map(item => ({
                  asin: item.asin,
                  ...selectedTestPeriods.reduce((acc, period) => {
                    acc[period] = item.periods[period].cm;
                    return acc;
                  }, {} as Record<string, number>),
                  control: item.periods.control.cm
                }))}
                margin={{ top: 20, right: 30, left: 30, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="asin" 
                  type="category"
                  height={70}
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
                <YAxis type="number" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'control') return [`€${value}`, 'Control'];
                    return [`€${value}`, data.test_info.tests[name as string].name];
                  }}
                  labelFormatter={(label) => `ASIN: ${label}`}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'control') return 'Control';
                    return data.test_info.tests[value as string].name;
                  }}
                />
                <Bar dataKey="control" name="control" fill={CONTROL_COLOR} />
                {selectedTestPeriods.map((period) => (
                  <Bar 
                    key={period} 
                    dataKey={period} 
                    name={period} 
                    fill={getTestPeriodColor(period)} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Compare contribution margin for each ASIN between selected test periods and control
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
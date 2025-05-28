"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Sector } from 'recharts';
import { fetchTestGroupById, fetchPriceTestsByGroup, fetchPriceTestSales, fetchPriceTestSalesByDate, fetchPriceTestSalesByAsin } from "@/lib/api";
import { ProductGroupInfo, PriceTest } from "@/components/data-table/columns";

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
  const [selectedTestPeriods, setSelectedTestPeriods] = useState<string[]>([]);
  const [activeTestIndex, setActiveTestIndex] = useState(0);
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  const [groupInfo, setGroupInfo] = useState<ProductGroupInfo | null>(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [priceTests, setPriceTests] = useState<PriceTest[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState<string | null>(null);
  const [controlPriceTestId, setControlPriceTestId] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<Record<string, any>>({});
  const [salesLoading, setSalesLoading] = useState<Record<string, boolean>>({});
  const [salesError, setSalesError] = useState<Record<string, string>>({});
  const [dailySalesData, setDailySalesData] = useState<Record<string, any>>({});
  const [dailySalesLoading, setDailySalesLoading] = useState<Record<string, boolean>>({});
  const [dailySalesError, setDailySalesError] = useState<Record<string, string>>({});
  const [asinSalesData, setAsinSalesData] = useState<Record<string, any>>({});
  const [asinSalesLoading, setAsinSalesLoading] = useState<Record<string, boolean>>({});
  const [asinSalesError, setAsinSalesError] = useState<Record<string, string>>({});

  // Fetch group information when groupId changes
  useEffect(() => {
    const loadGroupData = async () => {
      if (!groupId) return;
      
      // Load group info
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

      // Load price tests for this group
      setTestsLoading(true);
      setTestsError(null);
      try {
        const tests = await fetchPriceTestsByGroup(groupId);
        setPriceTests(tests);
        // Auto-select the first test if available
        if (tests.length > 0) {
          console.log('Auto-selecting first test:', tests[0]);
          setSelectedTestPeriods([tests[0].id]);
          // Set control price test ID from the first test
          if (tests[0].control_price_test_id) {
            console.log('Initial control price test ID:', tests[0].control_price_test_id);
            setControlPriceTestId(tests[0].control_price_test_id);
          } else {
            console.log('No control_price_test_id in first test');
            setControlPriceTestId(null);
          }
        } else {
          setSelectedTestPeriods([]);
          setControlPriceTestId(null);
        }
      } catch (err) {
        console.error('Failed to fetch price tests:', err);
        setTestsError(err instanceof Error ? err.message : 'Failed to load price tests');
        setSelectedTestPeriods([]);
      } finally {
        setTestsLoading(false);
      }
    };

    loadGroupData();
  }, [groupId]);

  // Fetch sales data when selected test periods or control price test ID changes
  useEffect(() => {
    const fetchAllSalesData = async () => {
      // Fetch sales data for all selected test periods
      for (const testId of selectedTestPeriods) {
        if (!salesData[testId] && !salesLoading[testId]) {
          await fetchSalesDataForTest(testId);
        }
        if (!dailySalesData[testId] && !dailySalesLoading[testId]) {
          await fetchDailySalesDataForTest(testId);
        }
        if (!asinSalesData[testId] && !asinSalesLoading[testId]) {
          await fetchAsinSalesDataForTest(testId);
        }
      }
      
      // Fetch sales data for control test if available
      if (controlPriceTestId && !salesData[controlPriceTestId] && !salesLoading[controlPriceTestId]) {
        await fetchSalesDataForTest(controlPriceTestId);
      }
      if (controlPriceTestId && !dailySalesData[controlPriceTestId] && !dailySalesLoading[controlPriceTestId]) {
        await fetchDailySalesDataForTest(controlPriceTestId);
      }
      if (controlPriceTestId && !asinSalesData[controlPriceTestId] && !asinSalesLoading[controlPriceTestId]) {
        await fetchAsinSalesDataForTest(controlPriceTestId);
      }
    };

    if (selectedTestPeriods.length > 0 && groupInfo?.items) {
      fetchAllSalesData();
    }
  }, [selectedTestPeriods, controlPriceTestId, groupInfo]);

  // Function to fetch sales data for a specific price test
  const fetchSalesDataForTest = async (testId: string) => {
    setSalesLoading(prev => ({ ...prev, [testId]: true }));
    setSalesError(prev => ({ ...prev, [testId]: '' }));
    
    try {
      const sales = await fetchPriceTestSales(testId);
      setSalesData(prev => ({ ...prev, [testId]: sales }));
      console.log(`Sales data for test ${testId}:`, sales);
    } catch (err) {
      console.error(`Failed to fetch sales for test ${testId}:`, err);
      setSalesError(prev => ({ 
        ...prev, 
        [testId]: err instanceof Error ? err.message : 'Failed to load sales data' 
      }));
    } finally {
      setSalesLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  // Function to fetch daily sales data for a specific price test
  const fetchDailySalesDataForTest = async (testId: string) => {
    setDailySalesLoading(prev => ({ ...prev, [testId]: true }));
    setDailySalesError(prev => ({ ...prev, [testId]: '' }));
    
    try {
      const dailySales = await fetchPriceTestSalesByDate(testId);
      setDailySalesData(prev => ({ ...prev, [testId]: dailySales }));
      console.log(`Daily sales data for test ${testId}:`, dailySales);
    } catch (err) {
      console.error(`Failed to fetch daily sales for test ${testId}:`, err);
      setDailySalesError(prev => ({ 
        ...prev, 
        [testId]: err instanceof Error ? err.message : 'Failed to load daily sales data' 
      }));
    } finally {
      setDailySalesLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  // Function to fetch ASIN sales data for a specific price test
  const fetchAsinSalesDataForTest = async (testId: string) => {
    if (!groupInfo?.items) return;
    
    setAsinSalesLoading(prev => ({ ...prev, [testId]: true }));
    setAsinSalesError(prev => ({ ...prev, [testId]: '' }));
    
    try {
      // Extract unique ASINs from groupInfo (deduplicate)
      const asins = Array.from(new Set(
        groupInfo.items
          .filter(item => item.is_active)
          .map(item => item.asin)
          .filter(asin => asin && asin.trim() !== '') // Remove empty/null ASINs
      ));
      
      if (asins.length === 0) {
        console.log(`No active ASINs found for test ${testId}`);
        setAsinSalesData(prev => ({ ...prev, [testId]: [] }));
        return;
      }
      
      console.log(`Fetching ASIN sales data for test ${testId} with ${asins.length} unique ASINs:`, asins);
      const asinSales = await fetchPriceTestSalesByAsin(testId, asins);
      setAsinSalesData(prev => ({ ...prev, [testId]: asinSales }));
      console.log(`ASIN sales data for test ${testId}:`, asinSales);
    } catch (err) {
      console.error(`Failed to fetch ASIN sales for test ${testId}:`, err);
      setAsinSalesError(prev => ({ 
        ...prev, 
        [testId]: err instanceof Error ? err.message : 'Failed to load ASIN sales data' 
      }));
    } finally {
      setAsinSalesLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  // Helper function to get color for a test period
  const getTestPeriodColor = (period: string): string => {
    return TEST_PERIOD_COLORS[period] || "#4C72B0"; // Default to blue if not found
  };

  // Helper function to get the current control price test ID
  const getCurrentControlPriceTestId = (): string | null => {
    return controlPriceTestId;
  };

  // Prepare data for pie charts - we'll just use the first selected period for the pie chart
  const primarySelectedPeriod = selectedTestPeriods[0];

  // Helper function to create pie data from ASIN sales data
  const createPieDataFromAsinSales = (testId: string) => {
    if (!asinSalesData[testId] || !Array.isArray(asinSalesData[testId])) {
      return { pieData: [], totalUnits: 0 };
    }
    
    const asinData = asinSalesData[testId];
    const totalUnits = asinData.reduce((sum: number, item: any) => sum + (item.data?.total_units || 0), 0);
    
    const pieData = asinData.map((item: any) => ({
      name: item.key || 'Unknown ASIN', // ASIN is in the 'key' field
      value: item.data?.total_units || 0, // Units are in 'data.total_units'
      percentage: totalUnits > 0 ? (((item.data?.total_units || 0) / totalUnits) * 100).toFixed(1) : '0.0'
    }));
    
    return { pieData, totalUnits };
  };

  // Get control pie data
  const controlPieResult = controlPriceTestId ? createPieDataFromAsinSales(controlPriceTestId) : { pieData: [], totalUnits: 0 };
  const controlPieData = controlPieResult.pieData;
  const controlTotalUnits = controlPieResult.totalUnits;

  // Helper function to create bar chart data from ASIN sales data
  const createAsinBarChartData = (metric: 'units' | 'sales' | 'cm') => {
    if (!groupInfo?.items) return [];
    
    // Get unique ASINs from the group (deduplicate)
    const allAsins = Array.from(new Set(
      groupInfo.items
        .filter(item => item.is_active)
        .map(item => item.asin)
        .filter(asin => asin && asin.trim() !== '') // Remove empty/null ASINs
    ));
    
    // Create data structure for each ASIN
    return allAsins.map(asin => {
      const asinData: any = { asin };
      
      // Add control data
      if (controlPriceTestId && asinSalesData[controlPriceTestId]) {
        const controlAsinData = asinSalesData[controlPriceTestId].find((item: any) => item.key === asin);
        if (metric === 'units') {
          asinData.control = controlAsinData?.data?.total_units || 0;
        } else if (metric === 'sales') {
          asinData.control = controlAsinData?.data?.total_sales || 0;
        } else if (metric === 'cm') {
          // Use sales as placeholder for contribution margin
          asinData.control = controlAsinData?.data?.total_sales || 0;
        }
      } else {
        asinData.control = 0;
      }
      
      // Add test period data
      selectedTestPeriods.forEach(period => {
        if (asinSalesData[period]) {
          const testAsinData = asinSalesData[period].find((item: any) => item.key === asin);
          if (metric === 'units') {
            asinData[period] = testAsinData?.data?.total_units || 0;
          } else if (metric === 'sales') {
            asinData[period] = testAsinData?.data?.total_sales || 0;
          } else if (metric === 'cm') {
            // Use sales as placeholder for contribution margin
            asinData[period] = testAsinData?.data?.total_sales || 0;
          }
        } else {
          asinData[period] = 0;
        }
      });
      
      return asinData;
    });
  };

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

  // Toggle a test period selection
  const toggleTestPeriod = (period: string) => {
    setSelectedTestPeriods(prev => {
      let newSelection: string[];
      
      if (prev.includes(period)) {
        // Don't allow deselecting the last period
        if (prev.length === 1) return prev;
        newSelection = prev.filter(p => p !== period);
      } else {
        // Limit to maximum 3 test periods
        if (prev.length >= 3) {
          return prev;
        }
        newSelection = [...prev, period];
      }
      
      // Update control price test ID from the last selected test
      if (newSelection.length > 0) {
        const lastSelectedTestId = newSelection[newSelection.length - 1];
        const lastSelectedTest = priceTests.find(test => test.id === lastSelectedTestId);
        console.log('Last selected test:', lastSelectedTest);
        if (lastSelectedTest?.control_price_test_id) {
          console.log('Setting control price test ID:', lastSelectedTest.control_price_test_id);
          setControlPriceTestId(lastSelectedTest.control_price_test_id);
        } else {
          console.log('No control_price_test_id found for test:', lastSelectedTest);
          setControlPriceTestId(null);
        }
      } else {
        setControlPriceTestId(null);
      }
      
      return newSelection;
    });
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
              {/* Extract ASINs for reuse */}
              {(() => {
                // Extract unique ASINs from groupInfo (deduplicate)
                const asins = Array.from(new Set(
                  groupInfo.items
                    .filter(item => item.is_active)
                    .map(item => item.asin)
                    .filter(asin => asin && asin.trim() !== '') // Remove empty/null ASINs
                ));
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Group:</p>
                        <p className="text-sm text-muted-foreground">{groupInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Number of ASINs:</p>
                        <p className="text-sm text-muted-foreground">{asins.length}</p>
                      </div>
                    </div>
                    
                    {/* ASIN List */}
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-2">ASINs in Group:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {asins.map((asin, index) => (
                          <div key={index} className="text-sm text-muted-foreground px-2 py-1">
                            <a 
                              href={`https://www.amazon.de/dp/${asin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 hover:underline"
                            >
                              {asin}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
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
          <CardDescription>
            Select multiple test periods to compare on the charts (max 3)
            {controlPriceTestId && (
              <span className="block text-xs text-muted-foreground mt-1">
                Control Price Test ID: {controlPriceTestId}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testsLoading ? (
            <div className="text-sm text-muted-foreground">Loading price tests...</div>
          ) : testsError ? (
            <div className="text-sm text-red-500">Error: {testsError}</div>
          ) : priceTests.length === 0 ? (
            <div className="text-sm text-muted-foreground">No price tests found for this group</div>
          ) : (
            <div className={`grid gap-4 ${
              priceTests.length <= 3 ? 'md:grid-cols-3' : 
              priceTests.length === 4 ? 'md:grid-cols-4' : 
              'md:grid-cols-5'
            }`}>
              {priceTests.map((test, index) => (
                <Card key={test.id} className={`border-l-4 ${selectedTestPeriods.includes(test.id) ? `border-l-[${getTestPeriodColor(test.id)}] bg-opacity-10 bg-[${getTestPeriodColor(test.id)}]` : 'border-l-gray-200'}`}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{test.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          test.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : test.status === 'running'
                            ? 'bg-blue-100 text-blue-800'
                            : test.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800'
                            : test.status === 'scheduled'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {test.status}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center h-5">
                      <Checkbox 
                        id={`test-${test.id}`} 
                        checked={selectedTestPeriods.includes(test.id)}
                        onCheckedChange={() => toggleTestPeriod(test.id)}
                        disabled={
                          (selectedTestPeriods.includes(test.id) && selectedTestPeriods.length === 1) || 
                          (!selectedTestPeriods.includes(test.id) && selectedTestPeriods.length >= 3)
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 text-xs space-y-1">
                    <div>
                      <span className="font-medium">Period:</span> {test.start_date} - {test.end_date}
                    </div>
                    <div>
                      <span className="font-medium">Objective:</span> <span className="text-muted-foreground">Not implemented</span>
                    </div>
                    <div>
                      <span className="font-medium">Confidence:</span> <span className="text-muted-foreground">Not implemented</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
            
            // Get the test data
            const currentTest = priceTests.find(test => test.id === testPeriod);
            const testSalesData = salesData[testPeriod];
            const controlSalesData = controlPriceTestId ? salesData[controlPriceTestId] : null;
            const isLoading = salesLoading[testPeriod] || (controlPriceTestId && salesLoading[controlPriceTestId]);
            const hasError = salesError[testPeriod] || (controlPriceTestId && salesError[controlPriceTestId]);
            
            // Calculate metrics from API data
            const calculateMetrics = () => {
              if (!testSalesData || !controlSalesData) {
                return null;
              }
              
              // Aggregate the sales data
              const testTotalSales = testSalesData.reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
              const testTotalUnits = testSalesData.reduce((sum: number, item: any) => sum + (item.data?.total_units || 0), 0);
              const controlTotalSales = controlSalesData.reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
              const controlTotalUnits = controlSalesData.reduce((sum: number, item: any) => sum + (item.data?.total_units || 0), 0);
              
              // Calculate averages
              const testAvgPrice = testTotalUnits > 0 ? testTotalSales / testTotalUnits : 0;
              const controlAvgPrice = controlTotalUnits > 0 ? controlTotalSales / controlTotalUnits : 0;
              
              // Calculate deltas
              const salesDelta = controlTotalSales > 0 ? ((testTotalSales - controlTotalSales) / controlTotalSales) * 100 : 0;
              const unitsDelta = controlTotalUnits > 0 ? ((testTotalUnits - controlTotalUnits) / controlTotalUnits) * 100 : 0;
              const priceDelta = controlAvgPrice > 0 ? ((testAvgPrice - controlAvgPrice) / controlAvgPrice) * 100 : 0;
              
              return {
                testTotalSales,
                testTotalUnits,
                controlTotalSales,
                controlTotalUnits,
                testAvgPrice,
                controlAvgPrice,
                salesDelta,
                unitsDelta,
                priceDelta
              };
            };
            
            const metrics = calculateMetrics();
            
            return (
              <div key={`metrics-${testPeriod}`} className={`${colSpan}`}>
                <Card>
                  <CardHeader className="pb-2" style={{ borderBottom: `2px solid ${getTestPeriodColor(testPeriod)}` }}>
                    <CardTitle>{currentTest?.name || 'Unknown Test'}</CardTitle>
                    <CardDescription>Comparison against control period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-sm text-muted-foreground p-4">Loading metrics data...</div>
                    ) : hasError ? (
                      <div className="text-sm text-red-500 p-4">Error loading metrics data</div>
                    ) : !controlPriceTestId ? (
                      <div className="text-sm text-muted-foreground p-4">No control test available for comparison</div>
                    ) : !metrics ? (
                      <div className="text-sm text-muted-foreground p-4">No data available for comparison</div>
                    ) : (
                      <div className={`grid ${selectedTestPeriods.length === 1 ? 'grid-cols-4' : 'grid-cols-2'} gap-3 my-3`}>
                        {/* Total Units Card */}
                        <div className="p-3 border rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">Total Units</p>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              metrics.unitsDelta >= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {metrics.unitsDelta >= 0 ? '+' : ''}
                              {metrics.unitsDelta.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xl font-bold">
                            {metrics.testTotalUnits}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            vs {metrics.controlTotalUnits} (control)
                          </p>
                        </div>

                        {/* Total Sales Card */}
                        <div className="p-3 border rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">Total Sales</p>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              metrics.salesDelta >= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {metrics.salesDelta >= 0 ? '+' : ''}
                              {metrics.salesDelta.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xl font-bold">
                            €{metrics.testTotalSales.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            vs €{metrics.controlTotalSales.toFixed(2)} (control)
                          </p>
                        </div>

                        {/* Contribution Margin Card - Using sales data as placeholder */}
                        <div className="p-3 border rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">Contribution Margin</p>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              metrics.salesDelta >= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {metrics.salesDelta >= 0 ? '+' : ''}
                              {metrics.salesDelta.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xl font-bold">
                            €{metrics.testTotalSales.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            vs €{metrics.controlTotalSales.toFixed(2)} (control)
                          </p>
                        </div>

                        {/* Average Price Card */}
                        <div className="p-3 border rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">Average Price</p>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              metrics.priceDelta >= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {metrics.priceDelta >= 0 ? '+' : ''}
                              {metrics.priceDelta.toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-xl font-bold">
                            €{metrics.testAvgPrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            vs €{metrics.controlAvgPrice.toFixed(2)} (control)
                          </p>
                        </div>
                      </div>
                    )}
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
            
            {/* Check if we have daily sales data */}
            {selectedTestPeriods.length > 0 && (
              selectedTestPeriods.some(period => dailySalesData[period]) || 
              (controlPriceTestId && dailySalesData[controlPriceTestId])
            ) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={(() => {
                    // Combine all daily sales data into a single dataset
                    const combinedData: Record<string, any> = {};
                    
                    // Add control period data
                    if (controlPriceTestId && dailySalesData[controlPriceTestId]) {
                      dailySalesData[controlPriceTestId].forEach((item: any) => {
                        const date = item.key;
                        if (!combinedData[date]) {
                          combinedData[date] = { date };
                        }
                        const value = item.data?.[comparisonMetric === 'units' ? 'total_units' : 'total_sales'] || 0;
                        combinedData[date][`control_${comparisonMetric}`] = value;
                      });
                    }
                    
                    // Add test period data
                    selectedTestPeriods.forEach(period => {
                      if (dailySalesData[period]) {
                        dailySalesData[period].forEach((item: any) => {
                          const date = item.key;
                          if (!combinedData[date]) {
                            combinedData[date] = { date };
                          }
                          const value = item.data?.[comparisonMetric === 'units' ? 'total_units' : 'total_sales'] || 0;
                          combinedData[date][`test_${period}_${comparisonMetric}`] = value;
                        });
                      }
                    });
                    
                    // Convert to sorted array
                    return Object.values(combinedData).sort((a: any, b: any) => 
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                  })()}
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
                    formatter={(value, name) => {
                      const formattedValue = comparisonMetric === "sales" ? `€${value}` : value;
                      const nameStr = String(name);
                      if (nameStr.startsWith('control_')) {
                        return [formattedValue, 'Control'];
                      } else if (nameStr.startsWith('test_')) {
                        const testId = nameStr.split('_')[1];
                        const testName = priceTests.find(test => test.id === testId)?.name || testId;
                        return [formattedValue, testName];
                      }
                      return [formattedValue, nameStr];
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `${date.toLocaleDateString()}`;
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      const valueStr = String(value);
                      if (valueStr.startsWith('control_')) {
                        return 'Control';
                      } else if (valueStr.startsWith('test_')) {
                        const testId = valueStr.split('_')[1];
                        const testName = priceTests.find(test => test.id === testId)?.name || testId;
                        return testName;
                      }
                      return valueStr;
                    }}
                  />
                  
                  {/* Control Period Line */}
                  {controlPriceTestId && dailySalesData[controlPriceTestId] && (
                    <Line 
                      dataKey={`control_${comparisonMetric}`}
                      name={`control_${comparisonMetric}`}
                      stroke={CONTROL_COLOR} 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls={false}
                    />
                  )}

                  {/* Test Period Lines */}
                  {selectedTestPeriods.map((period) => {
                    if (!dailySalesData[period]) return null;
                    
                    return (
                      <Line 
                        key={period}
                        dataKey={`test_${period}_${comparisonMetric}`}
                        name={`test_${period}_${comparisonMetric}`}
                        stroke={getTestPeriodColor(period)}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  {selectedTestPeriods.some(period => dailySalesLoading[period]) || 
                   (controlPriceTestId && dailySalesLoading[controlPriceTestId]) ? (
                    <p className="text-sm text-muted-foreground">Loading daily sales data...</p>
                  ) : selectedTestPeriods.some(period => dailySalesError[period]) || 
                       (controlPriceTestId && dailySalesError[controlPriceTestId]) ? (
                    <p className="text-sm text-red-500">Error loading daily sales data</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No daily sales data available</p>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-4">
              Comparing {comparisonMetric} between selected test periods and control period
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bar Charts Row */}
      {selectedTestPeriods.length > 0 && controlPriceTestId ? (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Units Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Units</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={(() => {
                    const chartData = [];
                    
                    // Add control data
                    if (controlPriceTestId && salesData[controlPriceTestId]) {
                      const controlTotalUnits = salesData[controlPriceTestId].reduce((sum: number, item: any) => sum + (item.data?.total_units || 0), 0);
                      chartData.push({
                        name: 'Control',
                        value: controlTotalUnits,
                        fill: CONTROL_COLOR
                      });
                    }
                    
                    // Add test data
                    selectedTestPeriods.forEach(period => {
                      if (salesData[period]) {
                        const testTotalUnits = salesData[period].reduce((sum: number, item: any) => sum + (item.data?.total_units || 0), 0);
                        const testName = priceTests.find(test => test.id === period)?.name || period;
                        chartData.push({
                          name: testName,
                          value: testTotalUnits,
                          fill: getTestPeriodColor(period)
                        });
                      }
                    });
                    
                    return chartData;
                  })()}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} units`} />
                  <Bar dataKey="value" name="Units" isAnimationActive={false}>
                    {(() => {
                      const chartData = [];
                      
                      // Add control data
                      if (controlPriceTestId && salesData[controlPriceTestId]) {
                        const controlTotalUnits = salesData[controlPriceTestId].reduce((sum: number, item: any) => sum + (item.data?.total_units || 0), 0);
                        chartData.push({
                          name: 'Control',
                          value: controlTotalUnits,
                          fill: CONTROL_COLOR
                        });
                      }
                      
                      // Add test data
                      selectedTestPeriods.forEach(period => {
                        if (salesData[period]) {
                          const testTotalUnits = salesData[period].reduce((sum: number, item: any) => sum + (item.data?.total_units || 0), 0);
                          const testName = priceTests.find(test => test.id === period)?.name || period;
                          chartData.push({
                            name: testName,
                            value: testTotalUnits,
                            fill: getTestPeriodColor(period)
                          });
                        }
                      });
                      
                      return chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ));
                    })()}
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
                  data={(() => {
                    const chartData = [];
                    
                    // Add control data
                    if (controlPriceTestId && salesData[controlPriceTestId]) {
                      const controlTotalSales = salesData[controlPriceTestId].reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
                      chartData.push({
                        name: 'Control',
                        value: controlTotalSales,
                        fill: CONTROL_COLOR
                      });
                    }
                    
                    // Add test data
                    selectedTestPeriods.forEach(period => {
                      if (salesData[period]) {
                        const testTotalSales = salesData[period].reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
                        const testName = priceTests.find(test => test.id === period)?.name || period;
                        chartData.push({
                          name: testName,
                          value: testTotalSales,
                          fill: getTestPeriodColor(period)
                        });
                      }
                    });
                    
                    return chartData;
                  })()}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Bar dataKey="value" name="Sales" isAnimationActive={false}>
                    {(() => {
                      const chartData = [];
                      
                      // Add control data
                      if (controlPriceTestId && salesData[controlPriceTestId]) {
                        const controlTotalSales = salesData[controlPriceTestId].reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
                        chartData.push({
                          name: 'Control',
                          value: controlTotalSales,
                          fill: CONTROL_COLOR
                        });
                      }
                      
                      // Add test data
                      selectedTestPeriods.forEach(period => {
                        if (salesData[period]) {
                          const testTotalSales = salesData[period].reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
                          const testName = priceTests.find(test => test.id === period)?.name || period;
                          chartData.push({
                            name: testName,
                            value: testTotalSales,
                            fill: getTestPeriodColor(period)
                          });
                        }
                      });
                      
                      return chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ));
                    })()}
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
                  data={(() => {
                    const chartData = [];
                    
                    // Add control data (using sales as placeholder for contribution margin)
                    if (controlPriceTestId && salesData[controlPriceTestId]) {
                      const controlTotalSales = salesData[controlPriceTestId].reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
                      chartData.push({
                        name: 'Control',
                        value: controlTotalSales,
                        fill: CONTROL_COLOR
                      });
                    }
                    
                    // Add test data (using sales as placeholder for contribution margin)
                    selectedTestPeriods.forEach(period => {
                      if (salesData[period]) {
                        const testTotalSales = salesData[period].reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
                        const testName = priceTests.find(test => test.id === period)?.name || period;
                        chartData.push({
                          name: testName,
                          value: testTotalSales,
                          fill: getTestPeriodColor(period)
                        });
                      }
                    });
                    
                    return chartData;
                  })()}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Bar dataKey="value" name="CM" isAnimationActive={false}>
                    {(() => {
                      const chartData = [];
                      
                      // Add control data
                      if (controlPriceTestId && salesData[controlPriceTestId]) {
                        const controlTotalSales = salesData[controlPriceTestId].reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
                        chartData.push({
                          name: 'Control',
                          value: controlTotalSales,
                          fill: CONTROL_COLOR
                        });
                      }
                      
                      // Add test data
                      selectedTestPeriods.forEach(period => {
                        if (salesData[period]) {
                          const testTotalSales = salesData[period].reduce((sum: number, item: any) => sum + (item.data?.total_sales || 0), 0);
                          const testName = priceTests.find(test => test.id === period)?.name || period;
                          chartData.push({
                            name: testName,
                            value: testTotalSales,
                            fill: getTestPeriodColor(period)
                          });
                        }
                      });
                      
                      return chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ));
                    })()}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Bar charts not available - select test periods and ensure control data is available</div>
      )}

      {/* ASIN Distribution Section - Individual Pie Chart Cards */}
      <h2 className="text-xl font-bold mt-6 mb-4">ASIN Distribution by Units</h2>
      
      {/* Show charts if we have ASIN sales data */}
      {selectedTestPeriods.length > 0 && (
        controlPriceTestId && asinSalesData[controlPriceTestId] || 
        selectedTestPeriods.some(period => asinSalesData[period])
      ) ? (
        (() => {
          // Calculate the grid layout based on the number of cards
          const totalCards = (controlPriceTestId && asinSalesData[controlPriceTestId] ? 1 : 0) + 
                           selectedTestPeriods.filter(period => asinSalesData[period]).length;
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
              {controlPriceTestId && asinSalesData[controlPriceTestId] && (
                <Card className={colSpan}>
                  <CardHeader className="pb-2" style={{ borderBottom: `2px solid ${CONTROL_COLOR}` }}>
                    <CardTitle className="text-lg">Control Period</CardTitle>
                    <CardDescription>Units distribution across ASINs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {asinSalesLoading[controlPriceTestId] ? (
                      <div className="h-[250px] flex items-center justify-center">
                        <div className="text-sm text-muted-foreground">Loading ASIN data...</div>
                      </div>
                    ) : asinSalesError[controlPriceTestId] ? (
                      <div className="h-[250px] flex items-center justify-center">
                        <div className="text-sm text-red-500">Error loading ASIN data</div>
                      </div>
                    ) : controlPieData.length === 0 ? (
                      <div className="h-[250px] flex items-center justify-center">
                        <div className="text-sm text-muted-foreground">No ASIN data available</div>
                      </div>
                    ) : (
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
                    )}
                    <div className="text-center text-xs text-muted-foreground mt-2">
                      Total: {controlTotalUnits} units
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Test Period Pie Charts - One card for each selected test period */}
              {selectedTestPeriods.map((period, periodIndex) => {
                // Skip if no ASIN data for this period
                if (!asinSalesData[period]) return null;
                
                // Get pie data for this test period
                const periodPieResult = createPieDataFromAsinSales(period);
                const periodPieData = periodPieResult.pieData;
                const periodTotalUnits = periodPieResult.totalUnits;

                const testName = priceTests.find(test => test.id === period)?.name || period;

                return (
                  <Card key={period} className={colSpan}>
                    <CardHeader className="pb-2" style={{ borderBottom: `2px solid ${getTestPeriodColor(period)}` }}>
                      <CardTitle className="text-lg">{testName}</CardTitle>
                      <CardDescription>Units distribution across ASINs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {asinSalesLoading[period] ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <div className="text-sm text-muted-foreground">Loading ASIN data...</div>
                        </div>
                      ) : asinSalesError[period] ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <div className="text-sm text-red-500">Error loading ASIN data</div>
                        </div>
                      ) : periodPieData.length === 0 ? (
                        <div className="h-[250px] flex items-center justify-center">
                          <div className="text-sm text-muted-foreground">No ASIN data available</div>
                        </div>
                      ) : (
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
                      )}
                      <div className="text-center text-xs text-muted-foreground mt-2">
                        Total: {periodTotalUnits} units
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })()
      ) : (
        <div className="text-sm text-muted-foreground">
          {selectedTestPeriods.length === 0 
            ? "Select test periods to view ASIN distribution" 
            : asinSalesLoading[selectedTestPeriods[0]] || (controlPriceTestId && asinSalesLoading[controlPriceTestId])
            ? "Loading ASIN sales data..."
            : "No ASIN sales data available for selected periods"
          }
        </div>
      )}

      {/* ASIN Unit Comparison */}
      {selectedTestPeriods.length > 0 && (
        controlPriceTestId && asinSalesData[controlPriceTestId] || 
        selectedTestPeriods.some(period => asinSalesData[period])
      ) ? (
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
                data={createAsinBarChartData('units')}
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
                    const testName = priceTests.find(test => test.id === name)?.name || name;
                    return [`${value} units`, testName];
                  }}
                  labelFormatter={(label) => `ASIN: ${label}`}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'control') return 'Control';
                    const testName = priceTests.find(test => test.id === value)?.name || value;
                    return testName;
                  }}
                />
                {controlPriceTestId && asinSalesData[controlPriceTestId] && (
                  <Bar dataKey="control" name="control" fill={CONTROL_COLOR} />
                )}
                {selectedTestPeriods.map((period) => (
                  asinSalesData[period] && (
                    <Bar 
                      key={period} 
                      dataKey={period} 
                      name={period} 
                      fill={getTestPeriodColor(period)} 
                    />
                  )
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Compare units sold for each ASIN between selected test periods and control
          </div>
        </CardContent>
      </Card>
      ) : (
        <div className="text-sm text-muted-foreground mb-4">
          {selectedTestPeriods.length === 0 
            ? "Select test periods to view ASIN units comparison" 
            : "No ASIN sales data available for comparison"
          }
        </div>
      )}

      {/* ASIN Sales Comparison */}
      {selectedTestPeriods.length > 0 && (
        controlPriceTestId && asinSalesData[controlPriceTestId] || 
        selectedTestPeriods.some(period => asinSalesData[period])
      ) ? (
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
                data={createAsinBarChartData('sales')}
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
                    const testName = priceTests.find(test => test.id === name)?.name || name;
                    return [`€${value}`, testName];
                  }}
                  labelFormatter={(label) => `ASIN: ${label}`}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'control') return 'Control';
                    const testName = priceTests.find(test => test.id === value)?.name || value;
                    return testName;
                  }}
                />
                {controlPriceTestId && asinSalesData[controlPriceTestId] && (
                  <Bar dataKey="control" name="control" fill={CONTROL_COLOR} />
                )}
                {selectedTestPeriods.map((period) => (
                  asinSalesData[period] && (
                    <Bar 
                      key={period} 
                      dataKey={period} 
                      name={period} 
                      fill={getTestPeriodColor(period)} 
                    />
                  )
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Compare sales revenue for each ASIN between selected test periods and control
          </div>
        </CardContent>
      </Card>
      ) : (
        <div className="text-sm text-muted-foreground mb-4">
          {selectedTestPeriods.length === 0 
            ? "Select test periods to view ASIN sales comparison" 
            : "No ASIN sales data available for comparison"
          }
        </div>
      )}

      {/* ASIN Contribution Margin Comparison */}
      {selectedTestPeriods.length > 0 && (
        controlPriceTestId && asinSalesData[controlPriceTestId] || 
        selectedTestPeriods.some(period => asinSalesData[period])
      ) ? (
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
                data={createAsinBarChartData('cm')}
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
                    const testName = priceTests.find(test => test.id === name)?.name || name;
                    return [`€${value}`, testName];
                  }}
                  labelFormatter={(label) => `ASIN: ${label}`}
                />
                <Legend 
                  formatter={(value) => {
                    if (value === 'control') return 'Control';
                    const testName = priceTests.find(test => test.id === value)?.name || value;
                    return testName;
                  }}
                />
                {controlPriceTestId && asinSalesData[controlPriceTestId] && (
                  <Bar dataKey="control" name="control" fill={CONTROL_COLOR} />
                )}
                {selectedTestPeriods.map((period) => (
                  asinSalesData[period] && (
                    <Bar 
                      key={period} 
                      dataKey={period} 
                      name={period} 
                      fill={getTestPeriodColor(period)} 
                    />
                  )
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Compare contribution margin for each ASIN between selected test periods and control
          </div>
        </CardContent>
      </Card>
      ) : (
        <div className="text-sm text-muted-foreground">
          {selectedTestPeriods.length === 0 
            ? "Select test periods to view ASIN contribution margin comparison" 
            : "No ASIN sales data available for comparison"
          }
        </div>
      )}
    </div>
  );
}
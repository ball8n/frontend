// src/lib/api.ts

// Import types directly
import { Product, TestGroup, PriceTest, ProductGroupInfo } from "@/components/data-table/columns"; 
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
const API_BASE_URL = "http://localhost:4200"; // Assuming API routes are relative to the app's origin

function waitForAuth(): Promise<User | null> {
  const auth = getAuth();
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // stop listening after first call
      resolve(user);
    });
  });
}

async function getAuthToken(): Promise<string | null> {
  const user = await waitForAuth();
  return user ? await user.getIdToken() : null;
}

// Helper function for handling API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
    console.error(`API Error: ${response.status} ${response.statusText}`, errorData);
    
    // Provide more specific error messages for common issues
    if (response.status === 401) {
      throw new Error(`Authentication failed: ${errorData.detail || 'Please check your login status'}`);
    } else if (response.status === 403) {
      throw new Error(`Access denied: ${errorData.detail || 'Insufficient permissions'}`);
    } else if (response.status === 404) {
      throw new Error(`Not found: ${errorData.detail || 'The requested resource was not found'}`);
    }
    
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  // Handle cases with no content (e.g., 204 No Content)
  if (response.status === 204) {
    return null as T; // Or handle appropriately based on expected return type
  }
  return response.json() as Promise<T>;
}

// Helper function to format Date to "yyyy-MM-DD"
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- Product API Calls ---

/**
 * Fetches the list of products.
 */
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/`,{
    method: 'GET',
    headers: {
      // Add Authorization header if needed, e.g.:
      'Authorization': `Bearer ${await getAuthToken()}`
    },
  });

  return handleResponse<Product[]>(response);
}

// --- Test Group API Calls --- 

/**
 * Fetches the list of price test groups.
 */
export async function fetchTestGroups(): Promise<TestGroup[]> {
  const response = await fetch(`${API_BASE_URL}/product-groups/`,{
    method: 'GET',
    headers: {
      // Add Authorization header if needed, e.g.:
      'Authorization': `Bearer ${await getAuthToken()}`
    },
  });
  return handleResponse<TestGroup[]>(response);
}

/**
 * Fetches a specific price test group by ID.
 */
export async function fetchTestGroupById(groupId: string): Promise<ProductGroupInfo> {
  const response = await fetch(`${API_BASE_URL}/product-groups/${groupId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`
    },
  });
  return handleResponse<ProductGroupInfo>(response);
}

/**
 * Creates a new price test group.
 * @param groupName The name of the new group.
 * @param productIds An array of product IDs to include in the group.
 * @returns The newly created test group object (adjust type based on actual API response).
 */
export async function createTestGroup(groupName: string, productIds: string[]): Promise<any> { // Adjust return type based on API
  const payload = {
    name: groupName,
    items: productIds,
  };

  const response = await fetch(`${API_BASE_URL}/product-groups/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add Authorization header if needed, e.g.:
      'Authorization': `Bearer ${await getAuthToken()}` 
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<any>(response); // Adjust return type based on API response
}


export async function fetchPriceTest(): Promise<PriceTest[]> {
  const response = await fetch(`${API_BASE_URL}/price-test/`,{
    method: 'GET',
    headers: {
      // Add Authorization header if needed, e.g.:
      'Authorization': `Bearer ${await getAuthToken()}`
    },
  });
  return handleResponse<PriceTest[]>(response);
}

/**
 * Fetches price tests for a specific group.
 */
export async function fetchPriceTestsByGroup(groupId: string): Promise<PriceTest[]> {
  const response = await fetch(`${API_BASE_URL}/price-test/by_group/${groupId}?is_controlled_test=false`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`
    },
  });
  return handleResponse<PriceTest[]>(response);
}

/**
 * Fetches sales data for a specific price test.
 */
export async function fetchPriceTestSales(priceTestId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/price-test/${priceTestId}/sales`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`
    },
  });
  return handleResponse<any>(response);
}

/**
 * Fetches sales data for specific ASINs within a price test.
 */
export async function fetchPriceTestSalesByAsin(priceTestId: string, asins: string[]): Promise<any> {
  const asinParams = asins.map(asin => `asins=${encodeURIComponent(asin)}`).join('&');
  const response = await fetch(`${API_BASE_URL}/price-test/${priceTestId}/sales/asin?${asinParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`
    },
  });
  return handleResponse<any>(response);
}

/**
 * Fetches daily sales data for a specific price test.
 */
export async function fetchPriceTestSalesByDate(priceTestId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/price-test/${priceTestId}/sales/date`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`
    },
  });
  return handleResponse<any>(response);
}

export async function createPriceTest(groupId: string, priceTestName: string,startDate: Date,endDate: Date, items: string[] ): Promise<any> { // Adjust return type based on API
  const payload = {
    name: priceTestName,
    group_id: groupId,
    start_date: formatDateToYYYYMMDD(startDate),
    end_date: formatDateToYYYYMMDD(endDate),
    items: items,
  };

  const response = await fetch(`${API_BASE_URL}/price-test/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add Authorization header if needed, e.g.:
      'Authorization': `Bearer ${await getAuthToken()}`
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<any>(response); // Adjust return type based on API response
}

// src/lib/api.ts

// Import types directly
import { Product, TestGroup, PriceTest } from "@/components/data-table/columns"; 
import { app } from "./firebase";
import { getAuth } from "firebase/auth";
const API_BASE_URL = "http://localhost:4200"; // Assuming API routes are relative to the app's origin


async function getAuthToken(): Promise<string | null> {
    // Logic to get Firebase ID token or other auth token
    const user = getAuth(app).currentUser;
    return user ? await user.getIdToken() : null;
    return null;  
}

// Helper function for handling API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
    console.error(`API Error: ${response.status} ${response.statusText}`, errorData);
    // Throw a more specific error or return a structured error object
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
  const response = await fetch(`${API_BASE_URL}/price-test-groups/`,{
    method: 'GET',
    headers: {
      // Add Authorization header if needed, e.g.:
      'Authorization': `Bearer ${await getAuthToken()}`
    },
  });
  return handleResponse<TestGroup[]>(response);
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

  const response = await fetch(`${API_BASE_URL}/price-test-groups/`, {
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

// --- Potentially add other API functions here ---

// Example function to get auth token (implement based on your auth setup)
// async function getAuthToken(): Promise<string | null> {
//   // Logic to get Firebase ID token or other auth token
//   // const user = getAuth(app).currentUser;
//   // return user ? await user.getIdToken() : null;
//   return null; 
// } 
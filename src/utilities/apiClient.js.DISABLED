// API client for calling Vercel backend functions
// This handles communication between the React frontend and Vercel serverless functions

// Get the base URL for API calls
const getApiBaseUrl = () => {
  // In production (Vercel), use the deployed URL
  // In development, use localhost (but API functions won't work locally)
  if (process.env.NODE_ENV === 'production') {
    return ''; // Empty string means same origin in production
  }
  // For development, you can test with deployed Vercel URL
  return process.env.REACT_APP_API_BASE_URL || '';
};

// Generic API call function with error handling
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    console.log(`📡 API Call: ${method} ${url}`);
    
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `API request failed with status ${response.status}`);
    }

    console.log(`✅ API Response: ${method} ${url}`, result);
    return result;

  } catch (error) {
    console.error(`❌ API Error: ${method} ${endpoint}`, error);
    
    // Return a consistent error format
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Sync customer check-in data to Google Sheets
export async function syncCheckinToSheets(customerData) {
  console.log('📊 Syncing check-in data to Google Sheets via API:', customerData);
  
  return await apiCall('/api/sheets?action=checkin', 'POST', {
    ticketNumber: customerData.ticketNumber,
    name: customerData.name,
    phone: customerData.phone,
    email: customerData.email,
    filingStatus: customerData.filingStatus,
    checkedInAt: customerData.checkedInAt || new Date().toISOString(),
    servedAt: customerData.servedAt || ''
  });
}

// Sync preparer assignment to Google Sheets
export async function syncPreparerToSheets(preparerLogData) {
  console.log('📋 Syncing preparer assignment to Google Sheets via API:', preparerLogData);
  
  return await apiCall('/api/sheets?action=preparer', 'POST', {
    timestamp: preparerLogData.timestamp,
    clientName: preparerLogData.clientName,
    preparerName: preparerLogData.preparerName,
    ticketNumber: preparerLogData.ticketNumber,
    status: preparerLogData.status
  });
}

// Test Google Sheets API connection
export async function testGoogleSheetsAPI() {
  console.log('🧪 Testing Google Sheets API connection...');
  
  return await apiCall('/api/sheets?action=test', 'GET');
}

// Backward compatibility wrapper for existing code
export const syncToClientDatabase = syncCheckinToSheets;
export const syncToPreparerLog = syncPreparerToSheets;
export const testGoogleSheetsConnection = testGoogleSheetsAPI;
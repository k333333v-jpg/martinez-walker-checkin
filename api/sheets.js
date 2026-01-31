// Vercel serverless function for Google Sheets integration
// This runs on the backend and can safely use Google Sheets API

const { google } = require('googleapis');

// CORS headers for frontend requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Google Sheets API
async function initializeGoogleSheets() {
  try {
    // Get credentials from environment variables
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      throw new Error('Missing Google Sheets credentials in environment variables');
    }

    console.log('🔧 Initializing Google Sheets API...');

    // Create JWT auth client
    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    // Initialize the sheets API
    const sheets = google.sheets({ version: 'v4', auth });
    
    return sheets;
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets API:', error);
    throw error;
  }
}

// Main Vercel function handler
module.exports = async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OK' });
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { method, body, query } = req;
    const { action } = query;

    console.log(`📡 API Request: ${method} /api/sheets?action=${action}`);

    // Validate request method based on action
    if ((action === 'test' && method !== 'GET') || 
        (action !== 'test' && method !== 'POST')) {
      return res.status(405).json({ 
        success: false, 
        error: `Method not allowed. Use ${action === 'test' ? 'GET' : 'POST'} for this action.` 
      });
    }

    // Initialize Google Sheets
    const sheets = await initializeGoogleSheets();
    const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('Missing REACT_APP_GOOGLE_SPREADSHEET_ID environment variable');
    }

    // Route to appropriate handler based on action
    switch (action) {
      case 'checkin':
        return await handleCheckinData(sheets, spreadsheetId, body, res);
      
      case 'preparer':
        return await handlePreparerData(sheets, spreadsheetId, body, res);
      
      case 'test':
        return await handleTestConnection(sheets, spreadsheetId, res);
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use: checkin, preparer, or test'
        });
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle client check-in data
async function handleCheckinData(sheets, spreadsheetId, customerData, res) {
  try {
    console.log('📊 Processing check-in data for Google Sheets:', customerData);

    // Validate required fields
    const required = ['ticketNumber', 'name', 'phone', 'email', 'filingStatus'];
    for (const field of required) {
      if (!customerData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Prepare row data for Client Database sheet
    const rowData = [
      customerData.ticketNumber,           // A: Ticket Number
      customerData.name,                   // B: Customer Name  
      customerData.phone,                  // C: Phone Number
      customerData.email,                  // D: Email Address
      customerData.filingStatus,           // E: Filing Status
      customerData.checkedInAt || new Date().toISOString(), // F: Check-in Time
      customerData.servedAt || '',         // G: Served Time
      new Date().toISOString()             // H: Sync Timestamp
    ];

    // Append data to Client Database sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Client Database!A:H',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData]
      }
    });

    console.log('✅ Successfully synced check-in to Google Sheets');

    return res.status(200).json({
      success: true,
      message: 'Customer check-in data synced to Google Sheets',
      data: {
        updatedCells: response.data.updates?.updatedCells || 0,
        updatedRange: response.data.updates?.updatedRange || 'Client Database!A:H'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to sync check-in data:', error);
    throw new Error(`Check-in sync failed: ${error.message}`);
  }
}

// Handle preparer assignment data
async function handlePreparerData(sheets, spreadsheetId, preparerLogData, res) {
  try {
    console.log('📋 Processing preparer assignment for Google Sheets:', preparerLogData);

    // Validate required fields
    const required = ['timestamp', 'clientName', 'preparerName', 'ticketNumber'];
    for (const field of required) {
      if (!preparerLogData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Prepare row data for Preparer Log sheet
    const rowData = [
      preparerLogData.timestamp,           // A: Timestamp
      preparerLogData.clientName,          // B: Client Name
      preparerLogData.preparerName,        // C: Preparer Name
      preparerLogData.ticketNumber         // D: Ticket Number
    ];

    // Append data to Preparer Log sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Preparer Log!A:D',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData]
      }
    });

    console.log('✅ Successfully synced preparer assignment to Google Sheets');

    return res.status(200).json({
      success: true,
      message: 'Preparer assignment synced to Google Sheets',
      data: {
        updatedCells: response.data.updates?.updatedCells || 0,
        updatedRange: response.data.updates?.updatedRange || 'Preparer Log!A:D'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to sync preparer data:', error);
    throw new Error(`Preparer sync failed: ${error.message}`);
  }
}

// Test Google Sheets connection
async function handleTestConnection(sheets, spreadsheetId, res) {
  try {
    console.log('🧪 Testing Google Sheets connection...');

    // Try to read the spreadsheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'properties.title,sheets.properties.title'
    });

    console.log('✅ Google Sheets connection test successful');

    return res.status(200).json({
      success: true,
      message: 'Google Sheets connection successful',
      data: {
        title: response.data.properties.title,
        sheets: response.data.sheets.map(sheet => sheet.properties.title),
        spreadsheetId: spreadsheetId
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Google Sheets connection test failed:', error);
    throw new Error(`Connection test failed: ${error.message}`);
  }
}
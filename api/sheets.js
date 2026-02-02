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
    const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;

    console.log('🔍 Environment variables check:', {
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey?.length || 0,
      privateKeyPrefix: privateKey?.substring(0, 50) + '...',
      clientEmail: clientEmail,
      projectId: projectId,
      spreadsheetId: spreadsheetId,
      allEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('REACT_APP'))
    });

    if (!privateKey || !clientEmail || !projectId) {
      const missingVars = [];
      if (!privateKey) missingVars.push('GOOGLE_PRIVATE_KEY');
      if (!clientEmail) missingVars.push('GOOGLE_CLIENT_EMAIL');
      if (!projectId) missingVars.push('GOOGLE_PROJECT_ID');
      
      throw new Error(`Missing Google Sheets credentials: ${missingVars.join(', ')}`);
    }

    console.log('🔧 Initializing Google Sheets API with valid credentials...');

    // Create JWT auth client
    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    // Test authentication
    console.log('🔐 Testing JWT authentication...');
    await auth.authorize();
    console.log('✅ JWT authentication successful');

    // Initialize the sheets API
    const sheets = google.sheets({ version: 'v4', auth });
    
    return sheets;
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets API:', error.message);
    console.error('❌ Full error:', error);
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
    const getActions = ['test', 'debug'];
    const isGetAction = getActions.includes(action);
    
    if ((isGetAction && method !== 'GET') || 
        (!isGetAction && method !== 'POST')) {
      return res.status(405).json({ 
        success: false, 
        error: `Method not allowed. Use ${isGetAction ? 'GET' : 'POST'} for this action.` 
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
      
      case 'debug':
        return await handleDebugInfo(sheets, spreadsheetId, res);
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use: checkin, preparer, test, or debug'
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

    // Prepare row data for Client Database sheet (simplified format)
    const rowData = [
      customerData.name,                   // A: Name  
      customerData.phone,                  // B: Phone
      customerData.email,                  // C: Email
      customerData.filingStatus            // D: Filing Status
    ];

    // Append data to Client Database sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Client Database!A:D',
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
    const required = ['timestamp', 'clientName', 'preparerName'];
    for (const field of required) {
      if (!preparerLogData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Prepare row data for Preparer Log sheet (simplified format)
    const rowData = [
      preparerLogData.clientName,          // A: Client Name
      preparerLogData.preparerName,        // B: Preparer Name
      preparerLogData.timestamp            // C: Timestamp
    ];

    // Append data to Preparer Log sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Preparer Log!A:C',
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
        updatedRange: response.data.updates?.updatedRange || 'Preparer Log!A:C'
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

// Comprehensive debug information handler
async function handleDebugInfo(sheets, spreadsheetId, res) {
  try {
    console.log('🔍 Debug endpoint called');

    // Environment variables check
    const envCheck = {
      GOOGLE_PRIVATE_KEY: {
        exists: !!process.env.GOOGLE_PRIVATE_KEY,
        length: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
        startsCorrectly: process.env.GOOGLE_PRIVATE_KEY?.startsWith('-----BEGIN PRIVATE KEY-----') || false,
        endsCorrectly: process.env.GOOGLE_PRIVATE_KEY?.includes('-----END PRIVATE KEY-----') || false,
        hasNewlines: process.env.GOOGLE_PRIVATE_KEY?.includes('\\n') || false
      },
      GOOGLE_CLIENT_EMAIL: {
        exists: !!process.env.GOOGLE_CLIENT_EMAIL,
        value: process.env.GOOGLE_CLIENT_EMAIL || 'NOT SET',
        isValidEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.GOOGLE_CLIENT_EMAIL || '')
      },
      GOOGLE_PROJECT_ID: {
        exists: !!process.env.GOOGLE_PROJECT_ID,
        value: process.env.GOOGLE_PROJECT_ID || 'NOT SET'
      },
      REACT_APP_GOOGLE_SPREADSHEET_ID: {
        exists: !!process.env.REACT_APP_GOOGLE_SPREADSHEET_ID,
        value: process.env.REACT_APP_GOOGLE_SPREADSHEET_ID || 'NOT SET',
        length: process.env.REACT_APP_GOOGLE_SPREADSHEET_ID?.length || 0
      }
    };

    // Test Google Sheets API connection
    let connectionTest = null;
    let authTest = null;
    let sheetAccessTest = null;

    try {
      // Test basic connection
      console.log('🔐 Testing Google API authentication...');
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'properties.title,sheets.properties.title'
      });
      
      connectionTest = {
        success: true,
        spreadsheetTitle: response.data.properties.title,
        sheets: response.data.sheets.map(sheet => sheet.properties.title)
      };

      // Test read access
      console.log('📊 Testing sheet read access...');
      const valuesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Client Database!A1:D1'
      });
      
      // Test write access with a sample entry
      console.log('✍️ Testing sheet write access...');
      const testData = [
        'Debug Test User',
        '(555) DEBUG',
        'debug@test.com',
        'Test'
      ];
      
      const writeResponse = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Client Database!A:D',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [testData]
        }
      });
      
      sheetAccessTest = {
        success: true,
        message: 'Sheet read and write access successful',
        readTest: {
          range: 'Client Database!A1:D1',
          values: valuesResponse.data.values || []
        },
        writeTest: {
          updatedCells: writeResponse.data.updates?.updatedCells || 0,
          updatedRange: writeResponse.data.updates?.updatedRange || 'N/A'
        }
      };

      authTest = {
        success: true,
        message: 'All authentication tests passed'
      };

    } catch (apiError) {
      authTest = {
        success: false,
        error: apiError.message,
        code: apiError.code,
        status: apiError.status
      };
    }

    return res.status(200).json({
      success: true,
      message: 'Debug information collected',
      debug: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        environmentVariables: envCheck,
        googleSheetsConnection: connectionTest,
        authenticationTest: authTest,
        sheetAccessTest: sheetAccessTest,
        allEnvKeys: Object.keys(process.env).filter(key => 
          key.includes('GOOGLE') || 
          key.includes('REACT_APP') || 
          key.includes('VERCEL')
        ).sort()
      }
    });

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        environmentVariables: {
          GOOGLE_PRIVATE_KEY: { exists: !!process.env.GOOGLE_PRIVATE_KEY },
          GOOGLE_CLIENT_EMAIL: { exists: !!process.env.GOOGLE_CLIENT_EMAIL },
          GOOGLE_PROJECT_ID: { exists: !!process.env.GOOGLE_PROJECT_ID },
          REACT_APP_GOOGLE_SPREADSHEET_ID: { exists: !!process.env.REACT_APP_GOOGLE_SPREADSHEET_ID }
        }
      }
    });
  }
}
// Vercel serverless function for Google Sheets integration
const { google } = require('googleapis');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function initializeGoogleSheets() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const projectId = process.env.GOOGLE_PROJECT_ID;
  const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;

  if (!privateKey || !clientEmail || !projectId) {
    const missing = [
      !privateKey && 'GOOGLE_PRIVATE_KEY',
      !clientEmail && 'GOOGLE_CLIENT_EMAIL',
      !projectId && 'GOOGLE_PROJECT_ID',
    ].filter(Boolean);
    throw new Error(`Missing Google Sheets credentials: ${missing.join(', ')}`);
  }

  const auth = new google.auth.JWT(
    clientEmail,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

async function ensureSheetExists(sheets, spreadsheetId, sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
  if (existing) return existing.properties.sheetId;

  const addRes = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: { requests: [{ addSheet: { properties: { title: sheetName } } }] }
  });
  return addRes.data.replies[0].addSheet.properties.sheetId;
}

async function ensureHeaders(sheets, spreadsheetId, sheetName, headers) {
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z1`
  });
  const existingHeaders = (existing.data.values || [[]])[0];
  if (existingHeaders.join(',') === headers.join(',')) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [headers] }
  });
}

// Main handler
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json({ message: 'OK' });
  }
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  try {
    const { action } = req.query;
    const getActions = ['test', 'debug', 'initialize', 'update-headers'];
    const expectedMethod = getActions.includes(action) ? 'GET' : 'POST';
    if (req.method !== expectedMethod) {
      return res.status(405).json({ success: false, error: `Use ${expectedMethod} for this action.` });
    }

    const sheets = await initializeGoogleSheets();
    const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) throw new Error('Missing REACT_APP_GOOGLE_SPREADSHEET_ID');

    switch (action) {
      case 'checkin':   return await handleCheckin(sheets, spreadsheetId, req.body, res);
      case 'preparer':  return await handlePreparer(sheets, spreadsheetId, req.body, res);
      case 'test':      return await handleTest(sheets, spreadsheetId, res);
      case 'debug':     return await handleDebug(sheets, spreadsheetId, res);
      case 'initialize': return await handleInitialize(sheets, spreadsheetId, res);
      case 'update-headers': return await handleUpdateHeaders(sheets, spreadsheetId, res);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action.' });
    }
  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Check-in: append to "Clients" tab with duplicate-email guard
async function handleCheckin(sheets, spreadsheetId, body, res) {
  const { name, phone, email } = body || {};
  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, error: 'Missing required fields: name, phone, email' });
  }

  await ensureSheetExists(sheets, spreadsheetId, 'Clients');
  await ensureHeaders(sheets, spreadsheetId, 'Clients', ['Timestamp', 'Name', 'Phone', 'Email']);

  // Duplicate check by email
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Clients!D2:D'
  });
  const emails = (existing.data.values || []).flat().map(e => e.toLowerCase());
  if (emails.includes(email.toLowerCase())) {
    return res.status(200).json({ success: true, duplicate: true, message: 'Duplicate email — skipped' });
  }

  const rowData = [new Date().toISOString(), name, phone, email];
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Clients!A2:D',
    valueInputOption: 'USER_ENTERED',
    resource: { values: [rowData] }
  });

  return res.status(200).json({ success: true, message: 'Client saved to Clients tab' });
}

// Preparer assignment: append to "Service Log" tab
async function handlePreparer(sheets, spreadsheetId, body, res) {
  const { preparerName, clientName } = body || {};
  if (!preparerName || !clientName) {
    return res.status(400).json({ success: false, error: 'Missing required fields: preparerName, clientName' });
  }

  await ensureSheetExists(sheets, spreadsheetId, 'Service Log');
  await ensureHeaders(sheets, spreadsheetId, 'Service Log', ['Timestamp', 'Tax Preparer', 'Client Name']);

  const rowData = [new Date().toISOString(), preparerName, clientName];
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Service Log!A2:C',
    valueInputOption: 'USER_ENTERED',
    resource: { values: [rowData] }
  });

  return res.status(200).json({ success: true, message: 'Assignment logged to Service Log tab' });
}

// Test connection
async function handleTest(sheets, spreadsheetId, res) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'properties.title,sheets.properties.title'
  });
  return res.status(200).json({
    success: true,
    data: {
      title: response.data.properties.title,
      sheets: response.data.sheets.map(s => s.properties.title),
      spreadsheetId
    }
  });
}

// Initialize sheets (ensure both exist with headers)
async function handleInitialize(sheets, spreadsheetId, res) {
  await ensureSheetExists(sheets, spreadsheetId, 'Clients');
  await ensureHeaders(sheets, spreadsheetId, 'Clients', ['Timestamp', 'Name', 'Phone', 'Email']);
  await ensureSheetExists(sheets, spreadsheetId, 'Service Log');
  await ensureHeaders(sheets, spreadsheetId, 'Service Log', ['Timestamp', 'Tax Preparer', 'Client Name']);
  return res.status(200).json({ success: true, message: 'Sheets initialized' });
}

// Update headers only
async function handleUpdateHeaders(sheets, spreadsheetId, res) {
  await ensureHeaders(sheets, spreadsheetId, 'Clients', ['Timestamp', 'Name', 'Phone', 'Email']);
  await ensureHeaders(sheets, spreadsheetId, 'Service Log', ['Timestamp', 'Tax Preparer', 'Client Name']);
  return res.status(200).json({ success: true, message: 'Headers updated' });
}

// Debug info
async function handleDebug(sheets, spreadsheetId, res) {
  const envCheck = {
    GOOGLE_PRIVATE_KEY: { exists: !!process.env.GOOGLE_PRIVATE_KEY, length: process.env.GOOGLE_PRIVATE_KEY?.length || 0 },
    GOOGLE_CLIENT_EMAIL: { exists: !!process.env.GOOGLE_CLIENT_EMAIL, value: process.env.GOOGLE_CLIENT_EMAIL || 'NOT SET' },
    GOOGLE_PROJECT_ID: { exists: !!process.env.GOOGLE_PROJECT_ID, value: process.env.GOOGLE_PROJECT_ID || 'NOT SET' },
    REACT_APP_GOOGLE_SPREADSHEET_ID: { exists: !!process.env.REACT_APP_GOOGLE_SPREADSHEET_ID }
  };

  let connectionTest = null;
  try {
    const r = await sheets.spreadsheets.get({ spreadsheetId, fields: 'properties.title,sheets.properties.title' });
    connectionTest = { success: true, title: r.data.properties.title, sheets: r.data.sheets.map(s => s.properties.title) };
  } catch (e) {
    connectionTest = { success: false, error: e.message };
  }

  return res.status(200).json({ success: true, debug: { environmentVariables: envCheck, connectionTest } });
}

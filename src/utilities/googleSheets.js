// Google Sheets Integration for Martinez & Walker Queue System

// Sheet 1: Client Database
export const syncToGoogleSheets = async (customerData) => {
  try {
    // Log customer data for now (replace with actual Google Sheets API call)
    console.log('📊 Sheet 1 - Client Database:', {
      timestamp: new Date().toISOString(),
      ticketNumber: customerData.ticketNumber,
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      filingStatus: customerData.filingStatus,
      checkedInAt: customerData.checkedInAt,
    });

    // Simulate API response
    return {
      success: true,
      message: 'Customer data logged to Client Database (Sheet 1)'
    };
  } catch (error) {
    console.error('Failed to sync to Client Database:', error);
    return {
      success: false,
      message: 'Failed to sync to Client Database',
      error
    };
  }
};

// Sheet 2: Preparer Log
export const syncToPreparerLog = async (preparerLogData) => {
  try {
    // Log preparer assignment data
    console.log('📋 Sheet 2 - Preparer Log:', {
      timestamp: preparerLogData.timestamp,
      clientName: preparerLogData.clientName,
      preparerName: preparerLogData.preparerName,
      ticketNumber: preparerLogData.ticketNumber,
    });

    // Simulate API response
    return {
      success: true,
      message: 'Preparer assignment logged to Preparer Log (Sheet 2)'
    };
  } catch (error) {
    console.error('Failed to sync to Preparer Log:', error);
    return {
      success: false,
      message: 'Failed to sync to Preparer Log',
      error
    };
  }
};

/*
  TO ENABLE REAL GOOGLE SHEETS INTEGRATION:

  1. Install googleapis:
     npm install googleapis

  2. Enable Google Sheets API in Google Cloud Console

  3. Create service account and download credentials JSON file

  4. Share your Google Sheet with the service account email

  5. Replace the syncToGoogleSheets function above with:

import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.REACT_APP_GOOGLE_CREDENTIALS_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID;

export const syncToGoogleSheets = async (customerData) => {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:H', // Columns A through H
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          customerData.ticketNumber,
          customerData.name,
          customerData.phone,
          customerData.email,
          customerData.filingStatus,
          customerData.checkedInAt,
          customerData.servedAt,
          new Date().toISOString() // Current timestamp
        ]]
      }
    });

    return {
      success: true,
      message: 'Successfully synced to Google Sheets',
      response: response.data
    };
  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error);
    return {
      success: false,
      message: 'Failed to sync to Google Sheets',
      error
    };
  }
};

  6. Set environment variables in .env file:
     REACT_APP_GOOGLE_CREDENTIALS_PATH=/path/to/credentials.json
     REACT_APP_GOOGLE_SHEET_ID=your_google_sheet_id

  7. Google Sheet column headers should be:
     A: Ticket Number
     B: Customer Name  
     C: Phone Number
     D: Email Address
     E: Filing Status
     F: Check-in Time
     G: Served Time
     H: Sync Timestamp
*/

export const setupGoogleSheetsIntegration = () => {
  console.log(`
    📊 Google Sheets Integration Setup Guide:
    
    1. Go to Google Cloud Console (console.cloud.google.com)
    2. Create new project or select existing one
    3. Enable Google Sheets API
    4. Create service account credentials
    5. Download JSON credentials file
    6. Share your Google Sheet with service account email
    7. Install googleapis: npm install googleapis
    8. Update environment variables
    9. Replace syncToGoogleSheets function with production code
    
    For detailed instructions, see comments in utilities/googleSheets.js
  `);
};
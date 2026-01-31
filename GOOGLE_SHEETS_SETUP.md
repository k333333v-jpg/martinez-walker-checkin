# 📊 Google Sheets Setup Guide for Martinez & Walker Queue System

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Create"** to create a new sheet
3. Rename it to **"Martinez Walker Queue"**

## Step 2: Set up the two required sheets

### Sheet 1: "Client Database"
Add these column headers in row 1:
- A1: Ticket Number
- B1: Customer Name  
- C1: Phone Number
- D1: Email Address
- E1: Filing Status
- F1: Check-in Time
- G1: Served Time
- H1: Sync Timestamp

### Sheet 2: "Preparer Log" 
1. Right-click on the sheet tab at bottom and select **"Insert sheet"**
2. Name it **"Preparer Log"**
3. Add these column headers in row 1:
- A1: Timestamp
- B1: Client Name
- C1: Preparer Name
- D1: Ticket Number

## Step 3: Share with Service Account

1. Click **"Share"** button in top right
2. Add this email: `martinez-walker-queue@martinez-walker-queue.iam.gserviceaccount.com`
3. Set permissions to **"Editor"**
4. Click **"Send"**

## Step 4: Get Sheet ID

1. Copy the Google Sheet URL
2. Extract the ID from the URL (the long string between `/d/` and `/edit`)
   
   Example: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   
   Sheet ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

3. Replace `REPLACE_WITH_ACTUAL_SHEET_ID` in the `.env` file with your actual Sheet ID

## Step 5: Vercel Environment Variables

Add these environment variables in your Vercel dashboard (Settings > Environment Variables):

```
REACT_APP_GOOGLE_SPREADSHEET_ID = [your_sheet_id]
GOOGLE_PRIVATE_KEY = [the_private_key_from_credentials]
GOOGLE_CLIENT_EMAIL = martinez-walker-queue@martinez-walker-queue.iam.gserviceaccount.com
GOOGLE_PROJECT_ID = martinez-walker-queue
```

⚠️ **Important**: When adding the private key to Vercel, make sure to include the `\n` characters in the key string exactly as they appear in the .env file.

## Step 6: Test Integration

1. Submit a test client through the check-in form
2. Check the Google Sheet - data should appear automatically
3. Use staff dashboard to assign client to preparer
4. Check "Preparer Log" sheet for assignment record

## Troubleshooting

- **403 Error**: Make sure the service account email has Editor access to the sheet
- **404 Error**: Check that the Sheet ID in environment variables is correct
- **Auth Error**: Verify the private key formatting includes proper `\n` characters
- **No data appearing**: Check browser console for error messages

## Security Notes

- The `google-credentials.json` file is in `.gitignore` and won't be committed to GitHub
- Environment variables are securely stored in Vercel
- Only the service account can access the sheet, not individual users
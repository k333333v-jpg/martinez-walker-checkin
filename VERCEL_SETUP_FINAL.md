# 🚀 FINAL Vercel Environment Variables Setup

## ✅ EXACT VALUES TO COPY AND PASTE

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project: `martinez-walker-checkin`
3. Go to Settings → Environment Variables

### Step 2: Add These 4 Environment Variables

Copy each value EXACTLY as shown below:

#### Variable 1: GOOGLE_CLIENT_EMAIL
```
martinez-walker-queue@martinez-walker-queue.iam.gserviceaccount.com
```

#### Variable 2: GOOGLE_PROJECT_ID
```
martinez-walker-queue
```

#### Variable 3: GOOGLE_PRIVATE_KEY
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCKW90WK+lQj4lD\nKIBROdJxiBl8Gl7hZVlsJoPCCrlZ7YZ/E6wnYWt9eoC2qXB6KMcxlZrcci0fk8Do\n6nopiYYxaurPsR5ffSyZ7Dz100Im2I3sTKUSTTX/ofMoh6U5U6d853Q95PX/uCJ3\nJhiTZFkGgcx7N46doVCSEVaWxaYgnuZDWBgPc2CkMbS0Yeuofd8aqzA+Hcgz4xfu\nTv4nvo5IXGC/+6xERMuzakpsWrvZr5hvlF/TlB0v7X42ljYOYZRjtQT4Vl1LR4tU\nT4k97XRGyJuvBFFNEp02vvE78xOh3Ks0pEO33o6QbcxnnEQz9ddX0nE1+k6kPSeP\ne1JNU91VAgMBAAECggEAEAl72TENIc2xXvvCe9Jpm8fnDvp42u6wwcITwu8T8uIp\nlRsw+NOS7lVqYUHHNsb5PRHBLyImLCMn2MIs7MRIWKay7DtJxk8FAhu0KS5BMa18\n2HyTJEmXeQz1g/zNCusGXopEGqnVAGdVyge8ENbbIXpJZagtO1ons6FCLxxebX4H\nQzxUiKKnHerr8Rj+yhhz0QJaf7eSNCP86ryQFW9uve/SgDq1Bu3Bmwdql0hEgI0v\nPFEMamkAcUw4L6r8zzzPL4dTKNepsYefwibEg4H/OcCoMa8Fdzay969YPCqk57u2\nmvRNDy5+a9eRZ0Ny/51HwD+aNuRG5QEhsoNU/Ni61QKBgQC9kFPQ1+1D4v+h02Lj\n6ODmJ2w99rKmqQV1gPoAFvx0zIcKjbenSM4PcUTwxF41kLc33CsOT2tTZDVmpI5v\nvIBW0vsdoIJz05hTnJPkagIi3tVPbTinBtF9ZEKlVQ5v+G/I03KwZwMop05y1D9j\n23pgjsSUeut5ife46VYeIGLm9wKBgQC62W0vLapzJLkYAw7rEPr9DqweabkjmL5v\n6HrVOHZhPfZ186HJugZZSY8r2E5ySMdRCMTyokvDWVFBcQJgtJFSicFlTG6IvZ0L\nGxkSpfrAJJwMldk4C1zmC/IPUzAjHZHrwnTUdC3PInhEFJYrZ9n+JHAbIJeVvHtf\nz3BLRt3PEwKBgAMOrdtjcCc1JQxWHXUxj1cG8b76GJ2JglYH04Bm3oF/vvnTmU+w\nY+pp2EPN1vskL2BOQ7+CVmfM6POT2dxBfQxpcLVknlYB5qYKk3QOpaQsVeJnD4/a\nE0zjbhO+kHIL3rmtd18S+kEQmbpOZAtXQd0G0HLYnK2kJQOtd78apJ23AoGANSEb\n/b1DaUg45U4BUO/cHlastF0liqylAdceDkDm0FG5IeLrzxt5MKxM7I+uBqsRGcaf\nkcp6NorQIwaKQYs2gzyuZCpuh6062WyUHYxal4YRZTa6tEfu227sHlVuK5393wbF\nB6AdYnePsPQVmzQFdVFRGzWSRL56akzmxlDZQ0cCgYEAhPsLWXUi2vK+oL5mr/eJ\n82CE1GrXT+YBJRqicDoozN7Vgq3Gv2OQuTirMj4lV4MwoVMZR8cHaVPLNU8mOQDm\n3rZc25r9l+uvkcREZkS3RLYO/tjw3crYCY2XtVS8jMhusuNh6iZL2noBPoezJSGL\ngvNN0708+XtERIuReoCxqHw=\n-----END PRIVATE KEY-----\n
```

#### Variable 4: REACT_APP_GOOGLE_SPREADSHEET_ID
```
[GET_THIS_FROM_YOUR_GOOGLE_SHEET_URL]
```

### Step 3: Environment Settings
For EACH variable, set it for:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 4: Create Google Sheet
1. Go to https://docs.google.com/spreadsheets/
2. Create a new spreadsheet
3. Name it: "Martinez Walker Queue"
4. Create two sheets:
   - Rename "Sheet1" to: **Client Database**
   - Add a new sheet named: **Preparer Log**

### Step 5: Set Up Sheet Headers

#### Client Database Sheet:
Add these headers in row 1:
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Ticket Number | Customer Name | Phone Number | Email Address | Filing Status | Check-in Time | Served Time | Sync Timestamp |

#### Preparer Log Sheet:
Add these headers in row 1:
| A | B | C | D |
|---|---|---|---|
| Timestamp | Client Name | Preparer Name | Ticket Number |

### Step 6: Share Sheet with Service Account
1. In your Google Sheet, click "Share" button
2. Add this email: `martinez-walker-queue@martinez-walker-queue.iam.gserviceaccount.com`
3. Give it "Editor" permissions
4. Click "Send"

### Step 7: Get Sheet ID
1. Look at your Google Sheet URL
2. Copy the long ID between `/d/` and `/edit`
3. Example: `https://docs.google.com/spreadsheets/d/1ABC123xyz789DEF456/edit`
4. Copy: `1ABC123xyz789DEF456`
5. Add this as the value for `REACT_APP_GOOGLE_SPREADSHEET_ID` in Vercel

### Step 8: Test the Connection
Visit this URL in your browser:
```
https://martinez-walker-checkin.vercel.app/api/sheets?action=debug
```

You should see JSON response with:
- `success: true`
- Environment variables status
- Google Sheets connection test
- Write access verification

### 🎉 You're Done!
The integration will automatically work once all environment variables are set.
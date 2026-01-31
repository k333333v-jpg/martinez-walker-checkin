# 🚀 Vercel Environment Variables Setup

## Required Environment Variables for Vercel Deployment

Add these environment variables in your Vercel dashboard (Settings > Environment Variables):

### 1. Google Sheets Configuration

**Name:** `REACT_APP_GOOGLE_SPREADSHEET_ID`  
**Value:** `[YOUR_GOOGLE_SHEET_ID]`  
**Description:** The ID from your Google Sheet URL  

**Name:** `GOOGLE_CLIENT_EMAIL`  
**Value:** `martinez-walker-queue@martinez-walker-queue.iam.gserviceaccount.com`  
**Description:** Google service account email  

**Name:** `GOOGLE_PROJECT_ID`  
**Value:** `martinez-walker-queue`  
**Description:** Google Cloud project ID  

**Name:** `GOOGLE_PRIVATE_KEY`  
**Value:** `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCKW90WK+lQj4lD\nKIBROdJxiBl8Gl7hZVlsJoPCCrlZ7YZ/E6wnYWt9eoC2qXB6KMcxlZrcci0fk8Do\n6nopiYYxaurPsR5ffSyZ7Dz100Im2I3sTKUSTTX/ofMoh6U5U6d853Q95PX/uCJ3\nJhiTZFkGgcx7N46doVCSEVaWxaYgnuZDWBgPc2CkMbS0Yeuofd8aqzA+Hcgz4xfu\nTv4nvo5IXGC/+6xERMuzakpsWrvZr5hvlF/TlB0v7X42ljYOYZRjtQT4Vl1LR4tU\nT4k97XRGyJuvBFFNEp02vvE78xOh3Ks0pEO33o6QbcxnnEQz9ddX0nE1+k6kPSeP\ne1JNU91VAgMBAAECggEAEAl72TENIc2xXvvCe9Jpm8fnDvp42u6wwcITwu8T8uIp\nlRsw+NOS7lVqYUHHNsb5PRHBLyImLCMn2MIs7MRIWKay7DtJxk8FAhu0KS5BMa18\n2HyTJEmXeQz1g/zNCusGXopEGqnVAGdVyge8ENbbIXpJZagtO1ons6FCLxxebX4H\nQzxUiKKnHerr8Rj+yhhz0QJaf7eSNCP86ryQFW9uve/SgDq1Bu3Bmwdql0hEgI0v\nPFEMamkAcUw4L6r8zzzPL4dTKNepsYefwibEg4H/OcCoMa8Fdzay969YPCqk57u2\nmvRNDy5+a9eRZ0Ny/51HwD+aNuRG5QEhsoNU/Ni61QKBgQC9kFPQ1+1D4v+h02Lj\n6ODmJ2w99rKmqQV1gPoAFvx0zIcKjbenSM4PcUTwxF41kLc33CsOT2tTZDVmpI5v\nvIBW0vsdoIJz05hTnJPkagIi3tVPbTinBtF9ZEKlVQ5v+G/I03KwZwMop05y1D9j\n23pgjsSUeut5ife46VYeIGLm9wKBgQC62W0vLapzJLkYAw7rEPr9DqweabkjmL5v\n6HrVOHZhPfZ186HJugZZSY8r2E5ySMdRCMTyokvDWVFBcQJgtJFSicFlTG6IvZ0L\nGxkSpfrAJJwMldk4C1zmC/IPUzAjHZHrwnTUdC3PInhEFJYrZ9n+JHAbIJeVvHtf\nz3BLRt3PEwKBgAMOrdtjcCc1JQxWHXUxj1cG8b76GJ2JglYH04Bm3oF/vvnTmU+w\nY+pp2EPN1vskL2BOQ7+CVmfM6POT2dxBfQxpcLVknlYB5qYKk3QOpaQsVeJnD4/a\nE0zjbhO+kHIL3rmtd18S+kEQmbpOZAtXQd0G0HLYnK2kJQOtd78apJ23AoGANSEb\n/b1DaUg45U4BUO/cHlastF0liqylAdceDkDm0FG5IeLrzxt5MKxM7I+uBqsRGcaf\nkcp6NorQIwaKQYs2gzyuZCpuh6062WyUHYxal4YRZTa6tEfu227sHlVuK5393wbF\nB6AdYnePsPQVmzQFdVFRGzWSRL56akzmxlDZQ0cCgYEAhPsLWXUi2vK+oL5mr/eJ\n82CE1GrXT+YBJRqicDoozN7Vgq3Gv2OQuTirMj4lV4MwoVMZR8cHaVPLNU8mOQDm\n3rZc25r9l+uvkcREZkS3RLYO/tjw3crYCY2XtVS8jMhusuNh6iZL2noBPoezJSGL\ngvNN0708+XtERIuReoCxqHw=\n-----END PRIVATE KEY-----\n`  
**Description:** Google service account private key (keep the \n characters exactly as shown)

## ⚠️ Important Notes:

1. **Private Key Format:** The private key MUST include the `\n` characters exactly as shown above
2. **Environment:** Set these for "Production", "Preview", and "Development" environments
3. **Security:** These values are securely stored and not visible in your code
4. **Google Sheet ID:** Get this from your Google Sheet URL between `/d/` and `/edit`

## 🧪 Testing After Setup:

1. Deploy to Vercel
2. Test the API endpoints:
   - `GET /api/sheets?action=test` - Test connection
   - `POST /api/sheets?action=checkin` - Submit check-in data
   - `POST /api/sheets?action=preparer` - Submit preparer assignment

## 📊 Expected Google Sheet Structure:

### Sheet 1: "Client Database"
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Ticket Number | Customer Name | Phone Number | Email Address | Filing Status | Check-in Time | Served Time | Sync Timestamp |

### Sheet 2: "Preparer Log"  
| A | B | C | D |
|---|---|---|---|
| Timestamp | Client Name | Preparer Name | Ticket Number |

## 🚀 After Setting Environment Variables:

1. Redeploy the application (automatic with GitHub pushes)
2. Test the check-in form - data should appear in Google Sheets
3. Monitor Vercel function logs for any errors
4. Check Google Sheets for automatic data population
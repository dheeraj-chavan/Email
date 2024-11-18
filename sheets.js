require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { scheduleEmails, emailAnalytics } = require('./scheduler');

async function accessSpreadsheet() {
  try {
    // Create a JWT client
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    // Initialize the spreadsheet
    const doc = new GoogleSpreadsheet('1-sJGHj_aqmpUui5-R83BVkiP042sIe8y0s0-Fj6Wdy8', serviceAccountAuth);

    // Load the document properties and worksheets
    await doc.loadInfo();
    console.log('Spreadsheet Title:', doc.title);

    // Access the first sheet
    const sheet = doc.sheetsByIndex[0];
    
    // Get all rows
    const rows = await sheet.getRows();
    console.log(`Loaded ${rows.length} rows`);

    // Array to hold email data
    const emailList = [];

    // Process each row
    for (const row of rows) {
      try {
        // Log raw row data for debugging
        console.log('Raw row data:', row._rawData);
        
        // Access the columns using the exact header names from your spreadsheet
        const companyName = row._rawData[0]; // First column
        const location = row._rawData[1];    // Second column
        const email = row._rawData[2];       // Third column
        const products = row._rawData[3];    // Fourth column

        console.log('Processing:', { companyName, location, email, products });

        if (email && email.includes('@')) {
          const personalizedMessage = `Dear ${companyName},\n\nWe noticed you're located in ${location} and wanted to share information about our ${products}.\n\nWe believe our solutions could greatly benefit your business.\n\nBest regards,\nYour Company Name`;
          
          // Add email data to the emailList array
          emailList.push({
            to: email,
            subject: `Special Offer for ${companyName}`,
            text: personalizedMessage,
          });
        } else {
          console.log(`Invalid or missing email for company: ${companyName}`);
        }
      } catch (error) {
        console.error(`Error processing row:`, error);
        continue; // Continue with next row even if current one fails
      }
    }

    // Schedule the emails
    const scheduleTime = new Date(Date.now() + 60 * 1000); // Schedule emails for 1 minute from now
    console.log(`Scheduling emails for: ${scheduleTime}`);
    scheduleEmails(emailList, scheduleTime);

    // Monitor email analytics in real-time
    const analyticsInterval = setInterval(() => {
      console.log('Current Analytics:', emailAnalytics);
    }, 5000); // Logs analytics every 5 seconds

    // Stop monitoring after 5 minutes
    setTimeout(() => {
      clearInterval(analyticsInterval);
      console.log('Stopped analytics monitoring');
    }, 5 * 60 * 1000);

  } catch (error) {
    console.error('Error accessing spreadsheet:', error);
  }
}

// Run the script
accessSpreadsheet().then(() => {
  console.log('Script execution completed');
}).catch(error => {
  console.error('Script failed:', error);
});

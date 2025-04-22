const { google } = require('googleapis');
require('dotenv').config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

const auth = new google.auth.JWT(
  CLIENT_EMAIL,
  null,
  PRIVATE_KEY,
  ['https://www.googleapis.com/auth/spreadsheets']
);
const sheets = google.sheets({ version: 'v4', auth });

async function addAdminUser() {
  const userRow = ['1', 'admin', 'admin123', 'admin', 'true'];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Users!A1:E1',
    valueInputOption: 'USER_ENTERED',
    resource: { values: [userRow] },
  });
  console.log('تم إضافة مستخدم admin بنجاح');
}

addAdminUser().catch(err => {
  console.error('حدث خطأ:', err.message);
  process.exit(1);
});

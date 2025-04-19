// إعداد الاتصال بـ Google Sheets API
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

async function getSheetRows(sheet, range = undefined) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range ? `${sheet}!${range}` : sheet,
  });
  return res.data.values;
}

async function addSheetRow(sheet, row) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: sheet,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [row] },
  });
}

module.exports = { getSheetRows, addSheetRow };

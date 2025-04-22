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

// تحديث صف في الشيت (حسب رقم الصف، يبدأ من 1 وليس 0)
async function updateSheetRow(sheet, rowIndex, newRow) {
  const range = `${sheet}!A${rowIndex}:Z${rowIndex}`; // يفترض أن الأعمدة حتى Z كحد أقصى
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [newRow] },
  });
}

// حذف صف من الشيت (حسب رقم الصف، يبدأ من 1)
async function deleteSheetRow(sheet, rowIndex) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: await getSheetIdByName(sheet),
            dimension: 'ROWS',
            startIndex: rowIndex - 1, // Google Sheets API يبدأ من 0
            endIndex: rowIndex
          }
        }
      }]
    }
  });
}

// جلب sheetId من اسم الشيت
async function getSheetIdByName(sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
  return sheet.properties.sheetId;
}

module.exports = { getSheetRows, addSheetRow, updateSheetRow, deleteSheetRow };


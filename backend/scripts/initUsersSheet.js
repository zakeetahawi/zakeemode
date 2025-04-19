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

async function resetAndInitSheets() {
  // 1. احصل على جميع الصفحات (Sheets) الحالية
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const allSheets = spreadsheet.data.sheets || [];

  // 2. احذف جميع الصفحات (Sheets) ما عدا واحدة (الأولى)
  let requests = [];
  if (allSheets.length > 1) {
    // احتفظ بالأولى، احذف الباقي
    for (let i = 1; i < allSheets.length; i++) {
      requests.push({ deleteSheet: { sheetId: allSheets[i].properties.sheetId } });
    }
    await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests } });
  }

  // 2.1 عدل اسم الصفحة المتبقية إلى Users فقط إذا لم تكن موجودة
  const spreadsheetAfterDelete = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const firstSheet = spreadsheetAfterDelete.data.sheets[0];
  const sheetNames = spreadsheetAfterDelete.data.sheets.map(s => s.properties.title);
  if (!sheetNames.includes('Users')) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          { updateSheetProperties: { properties: { sheetId: firstSheet.properties.sheetId, title: 'Users' }, fields: 'title' } }
        ]
      }
    });
  }

  // 3. أنشئ الصفحات الجديدة مع رؤوس الأعمدة
  const sheetsToCreate = [
    {
      title: 'Users',
      headers: ['id', 'username', 'password', 'role', 'active']
    },
    {
      title: 'Clients',
      headers: ['ClientID', 'Name', 'Phone', 'Address', 'Type', 'Notes', 'CreatedAt', 'UpdatedAt', 'IsActive']
    },
    {
      title: 'Orders',
      headers: ['OrderID', 'ClientID', 'OrderNumber', 'OrderType', 'ServiceTypes', 'InvoiceNumber', 'ContractNumber', 'Notes', 'DeliveryType', 'DeliveryBranch', 'Status', 'Priority', 'CreatedAt', 'UpdatedAt']
    },
    {
      title: 'Inventory',
      headers: ['ItemID', 'ItemName', 'Category', 'Quantity', 'Unit', 'Price', 'RelatedOrderID', 'CutOrderNumber', 'FactorySent', 'ExitPermitNumber', 'ContractNumber', 'Status', 'Notes', 'CreatedAt', 'UpdatedAt', 'NotificationSent']
    },
    {
      title: 'Installations',
      headers: ['InstallationID', 'OrderID', 'ClientID', 'Status', 'AppointmentDate', 'AssignedTeam', 'ContractNumber', 'Notes', 'NotificationSent', 'CreatedAt', 'UpdatedAt']
    },
    {
      title: 'Measurements',
      headers: ['MeasurementID', 'OrderID', 'ClientID', 'Status', 'AppointmentDate', 'AssignedTeam', 'PDFLink', 'Notes', 'NotificationSent', 'CreatedAt', 'UpdatedAt']
    }
  ];

  // أنشئ جميع الصفحات
  const spreadsheetNow = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const currentSheetNames = spreadsheetNow.data.sheets.map(s => s.properties.title);
  for (const sheet of sheetsToCreate) {
    if (!currentSheetNames.includes(sheet.title)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [
            { addSheet: { properties: { title: sheet.title } } }
          ]
        }
      });
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheet.title}!A1:${String.fromCharCode(65 + sheet.headers.length - 1)}1`,
      valueInputOption: 'RAW',
      resource: { values: [sheet.headers] }
    });
  }
  console.log('تمت إعادة تهيئة جميع الصفحات بنجاح.');
}

resetAndInitSheets().catch(err => {
  console.error('حدث خطأ:', err.message);
  process.exit(1);
});

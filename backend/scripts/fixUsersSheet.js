const { getSheetRows, updateSheetRow } = require('../googleSheets');
require('dotenv').config();

const SHEET_NAME = 'Users';

async function fixUsersSheet() {
  const rows = await getSheetRows(SHEET_NAME);
  const headers = rows[0];
  const expectedLen = headers.length;
  let fixed = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < expectedLen) {
      // أكمل الصف بقيم فارغة
      const newRow = [...row];
      while (newRow.length < expectedLen) newRow.push('');
      await updateSheetRow(SHEET_NAME, i + 1, newRow); // الصفوف تبدأ من 1
      fixed++;
    }
  }
  if (fixed > 0) {
    console.log(`تم تصحيح ${fixed} صف/صفوف في جدول المستخدمين.`);
  } else {
    console.log('جميع الصفوف مكتملة ولا تحتاج تصحيح.');
  }
}

fixUsersSheet().catch(err => {
  console.error('حدث خطأ:', err.message);
  process.exit(1);
});

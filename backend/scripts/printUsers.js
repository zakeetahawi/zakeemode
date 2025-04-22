const { getSheetRows } = require('../googleSheets');
(async () => {
  const rows = await getSheetRows('Users');
  console.log(rows);
})();

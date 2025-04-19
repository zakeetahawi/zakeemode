const express = require('express');
const router = express.Router();
const { getSheetRows, addSheetRow } = require('../googleSheets');

const SHEET_NAME = 'Inventory';

// جلب جميع الأصناف
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const inventory = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة صنف جديد
router.post('/', async (req, res) => {
  try {
    const { ItemName, Category, Quantity, Unit, Price, RelatedOrderID, CutOrderNumber, FactorySent, ExitPermitNumber, ContractNumber, Status, Notes, CreatedAt, UpdatedAt, NotificationSent } = req.body;
    const row = [
      '', // ItemID (يتم توليده لاحقًا)
      ItemName,
      Category,
      Quantity,
      Unit,
      Price,
      RelatedOrderID,
      CutOrderNumber,
      FactorySent,
      ExitPermitNumber,
      ContractNumber,
      Status,
      Notes,
      CreatedAt,
      UpdatedAt,
      NotificationSent
    ];
    await addSheetRow(SHEET_NAME, row);
    res.status(201).json({ message: 'تمت إضافة الصنف بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

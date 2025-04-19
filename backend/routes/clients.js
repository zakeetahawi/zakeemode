const express = require('express');
const router = express.Router();
const { getSheetRows, addSheetRow } = require('../googleSheets');

const SHEET_NAME = 'Clients';

// جلب جميع العملاء
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const clients = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة عميل جديد
router.post('/', async (req, res) => {
  try {
    const { Name, Phone, Address, Type, Notes, CreatedAt, UpdatedAt, IsActive } = req.body;
    const row = [
      '', // ClientID (يتم توليده لاحقًا)
      Name,
      Phone,
      Address,
      Type,
      Notes,
      CreatedAt,
      UpdatedAt,
      IsActive
    ];
    await addSheetRow(SHEET_NAME, row);
    res.status(201).json({ message: 'تمت إضافة العميل بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

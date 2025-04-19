const express = require('express');
const router = express.Router();
const { getSheetRows, addSheetRow } = require('../googleSheets');

const SHEET_NAME = 'Measurements';

// جلب جميع المقاسات
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const measurements = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة مقاس جديد
router.post('/', async (req, res) => {
  try {
    const { OrderID, ClientID, Status, AppointmentDate, AssignedTeam, PDFLink, Notes, NotificationSent, CreatedAt, UpdatedAt } = req.body;
    const row = [
      '', // MeasurementID (يتم توليده لاحقًا)
      OrderID,
      ClientID,
      Status,
      AppointmentDate,
      AssignedTeam,
      PDFLink,
      Notes,
      NotificationSent,
      CreatedAt,
      UpdatedAt
    ];
    await addSheetRow(SHEET_NAME, row);
    res.status(201).json({ message: 'تمت إضافة المقاس بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

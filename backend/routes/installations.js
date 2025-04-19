const express = require('express');
const router = express.Router();
const { getSheetRows, addSheetRow } = require('../googleSheets');

const SHEET_NAME = 'Installations';

// جلب جميع التركيبات
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const installations = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
    res.json(installations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة تركيب جديد
router.post('/', async (req, res) => {
  try {
    const { OrderID, ClientID, Status, AppointmentDate, AssignedTeam, ContractNumber, Notes, NotificationSent, CreatedAt, UpdatedAt } = req.body;
    const row = [
      '', // InstallationID (يتم توليده لاحقًا)
      OrderID,
      ClientID,
      Status,
      AppointmentDate,
      AssignedTeam,
      ContractNumber,
      Notes,
      NotificationSent,
      CreatedAt,
      UpdatedAt
    ];
    await addSheetRow(SHEET_NAME, row);
    res.status(201).json({ message: 'تمت إضافة التركيب بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

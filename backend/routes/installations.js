const express = require('express');
const router = express.Router();

// دالة فحص الصلاحية
function checkRole(req, res, next, allowedRoles = ['admin', 'مدير', 'مشرف', 'مدير النظام']) {
  const role = req.headers['x-user-role'] || req.body.role || req.body.Role;
  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({ error: 'ليس لديك الصلاحية لتنفيذ هذا الإجراء' });
  }
  next();
}

const { getSheetRows, addSheetRow, updateSheetRow, deleteSheetRow } = require('../googleSheets');

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
router.post('/', (req, res, next) => checkRole(req, res, next), async (req, res) => {
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

// حذف تركيب فعلياً من Google Sheets
router.delete('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('InstallationID');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'التركيب غير موجود' });
    await deleteSheetRow(SHEET_NAME, rowIndex + 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تعديل بيانات تركيب
router.put('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('InstallationID');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'التركيب غير موجود' });
    const updatedRow = headers.map(h => req.body[h] !== undefined ? req.body[h] : rows[rowIndex][headers.indexOf(h)]);
    await updateSheetRow(SHEET_NAME, rowIndex + 1, updatedRow);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

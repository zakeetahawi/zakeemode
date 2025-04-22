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

const SHEET_NAME = 'Clients';
const ADMIN_ROLES = ['admin', 'مدير', 'مشرف', 'مدير النظام'];

// جلب جميع العملاء مع دعم الفروع
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const clients = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      if (!('branch' in obj)) obj.branch = '1';
      return obj;
    });
    const userRole = req.headers['x-user-role'] || '';
    const userBranch = req.headers['x-user-branch'] || '';
    if (!ADMIN_ROLES.includes(userRole) && userBranch) {
      return res.json(clients.filter(c => c.branch === userBranch));
    }
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة عميل جديد مع دعم الفرع
router.post('/', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { Name, Phone, Address, Type, Notes, CreatedAt, UpdatedAt, IsActive, branch } = req.body;
    const clientBranch = branch || req.headers['x-user-branch'] || '1';
    const row = [
      '', // ClientID (يتم توليده لاحقًا)
      Name,
      Phone,
      Address,
      Type,
      Notes,
      CreatedAt,
      UpdatedAt,
      IsActive,
      clientBranch
    ];
    await addSheetRow(SHEET_NAME, row);
    res.status(201).json({ message: 'تمت إضافة العميل بنجاح', branch: clientBranch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف عميل فعلياً من Google Sheets
router.delete('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('ClientID');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'العميل غير موجود' });
    await deleteSheetRow(SHEET_NAME, rowIndex + 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تعديل بيانات عميل مع دعم الفرع
router.put('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('ClientID');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'العميل غير موجود' });
    const updatedRow = headers.map(h =>
      req.body[h] !== undefined ? req.body[h] :
      (h === 'branch' && rows[rowIndex][headers.indexOf(h)] === undefined ? '1' : rows[rowIndex][headers.indexOf(h)])
    );
    await updateSheetRow(SHEET_NAME, rowIndex + 1, updatedRow);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

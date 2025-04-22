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

const SHEET_NAME = 'Inventory';
const ADMIN_ROLES = ['admin', 'مدير', 'مشرف', 'مدير النظام'];

// جلب جميع الأصناف مع دعم الفروع
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const inventory = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      if (!('branch' in obj)) obj.branch = '1';
      return obj;
    });
    const userRole = req.headers['x-user-role'] || '';
    const userBranch = req.headers['x-user-branch'] || '';
    if (!ADMIN_ROLES.includes(userRole) && userBranch) {
      return res.json(inventory.filter(i => i.branch === userBranch));
    }
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة صنف جديد مع دعم الفرع
router.post('/', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { ItemName, Category, Quantity, Unit, Price, RelatedOrderID, CutOrderNumber, FactorySent, ExitPermitNumber, ContractNumber, Status, Notes, CreatedAt, UpdatedAt, NotificationSent, branch } = req.body;
    const itemBranch = branch || req.headers['x-user-branch'] || '1';
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
      NotificationSent,
      itemBranch
    ];
    await addSheetRow(SHEET_NAME, row);
    res.status(201).json({ message: 'تمت إضافة الصنف بنجاح', branch: itemBranch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف صنف فعلياً من Google Sheets
router.delete('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('ItemID');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'الصنف غير موجود' });
    await deleteSheetRow(SHEET_NAME, rowIndex + 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تعديل بيانات صنف مع دعم الفرع
router.put('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('ItemID');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'الصنف غير موجود' });
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

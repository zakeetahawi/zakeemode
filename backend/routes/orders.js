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

const SHEET_NAME = 'Orders';
const ADMIN_ROLES = ['admin', 'مدير', 'مشرف', 'مدير النظام'];

// جلب جميع الطلبات مع دعم الفروع
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const orders = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      if (!('branch' in obj)) obj.branch = '1';
      // فك JSON إذا كان موجودًا في Fabrics
      if (obj.Fabrics) {
        try { obj.Fabrics = JSON.parse(obj.Fabrics); } catch { obj.Fabrics = []; }
      } else {
        obj.Fabrics = [];
      }
      return obj;
    });
    const userRole = req.headers['x-user-role'] || '';
    const userBranch = req.headers['x-user-branch'] || '';
    if (!ADMIN_ROLES.includes(userRole) && userBranch) {
      return res.json(orders.filter(o => o.branch === userBranch));
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة طلب جديد مع دعم الفروع واختيار عدة أنواع قماش (Fabrics)
router.post('/', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { ClientID, OrderNumber, OrderType, ServiceTypes, InvoiceNumber, ContractNumber, Notes, DeliveryType, DeliveryBranch, Status, Priority, CreatedAt, UpdatedAt, branch, Fabrics } = req.body;
    const orderBranch = branch || req.headers['x-user-branch'] || '1';
    // Fabrics: مصفوفة أصناف القماش (مثال: [{ name: 'قماش1', qty: 5 }, ...])
    const fabricsStr = Fabrics ? JSON.stringify(Fabrics) : JSON.stringify([]);
    const row = [
      '', // OrderID (يتم توليده لاحقًا)
      ClientID,
      OrderNumber,
      OrderType,
      ServiceTypes,
      InvoiceNumber,
      ContractNumber,
      Notes,
      DeliveryType,
      DeliveryBranch,
      Status,
      Priority,
      CreatedAt,
      UpdatedAt,
      orderBranch,
      fabricsStr
    ];
    await addSheetRow(SHEET_NAME, row);
    res.status(201).json({ message: 'تمت إضافة الطلب بنجاح', branch: orderBranch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف طلب فعلياً من Google Sheets
router.delete('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('OrderID');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'الطلب غير موجود' });
    await deleteSheetRow(SHEET_NAME, rowIndex + 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تعديل بيانات طلب مع دعم الفرع وتعديل أصناف القماش
router.put('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('OrderID');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'الطلب غير موجود' });
    const updatedRow = headers.map(h => {
      if (h === 'Fabrics' && req.body.Fabrics !== undefined) {
        return JSON.stringify(req.body.Fabrics);
      }
      if (req.body[h] !== undefined) return req.body[h];
      if (h === 'branch' && rows[rowIndex][headers.indexOf(h)] === undefined) return '1';
      return rows[rowIndex][headers.indexOf(h)];
    });
    await updateSheetRow(SHEET_NAME, rowIndex + 1, updatedRow);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

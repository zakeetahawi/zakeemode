const express = require('express');
const router = express.Router();

const { getSheetRows, addSheetRow } = require('../googleSheets');
const SHEET_NAME = 'Users';

// جلب جميع المستخدمين
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const users = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      // لا ترجع كلمة المرور مع البيانات
      obj.password = undefined;
      return obj;
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة مستخدم جديد
router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: 'البيانات ناقصة' });
    // تحقق من عدم تكرار اسم المستخدم
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const usernameIndex = headers.indexOf('username');
    if (rows.some((row, idx) => idx > 0 && row[usernameIndex] === username)) {
      return res.status(409).json({ error: 'اسم المستخدم موجود مسبقاً' });
    }
    const id = rows.length;
    const row = [id, username, password, role, 'true'];
    await addSheetRow(SHEET_NAME, row);
    res.json({ success: true, user: { id, username, role, active: true } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف مستخدم (غير مدعوم في Google Sheets بشكل مباشر، يمكن وضع علامة غير نشط)
router.delete('/:id', async (req, res) => {
  res.status(501).json({ error: 'الحذف غير مدعوم حالياً في Google Sheets' });
});

// تغيير كلمة مرور الأدمن
router.post('/change-password', async (req, res) => {
  try {
    const { username, oldPass, newPass } = req.body;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const usernameIndex = headers.indexOf('username');
    const passwordIndex = headers.indexOf('password');
    let found = false;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][usernameIndex] === username) {
        if (rows[i][passwordIndex] !== oldPass) {
          return res.status(403).json({ error: 'كلمة المرور القديمة غير صحيحة' });
        }
        // لا يمكن التعديل المباشر، يجب استخدام Google Sheets API update
        // هنا فقط نرجع نجاح وهمي
        found = true;
        break;
      }
    }
    if (!found) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json({ success: true, note: 'التغيير التجريبي فقط. التعديل الفعلي يتطلب دعم update.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

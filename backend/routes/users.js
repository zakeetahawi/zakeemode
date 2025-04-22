const express = require('express');
const router = express.Router();

// دالة فحص الصلاحية
function checkRole(req, res, next, allowedRoles = ['admin', 'مدير', 'مشرف', 'مدير النظام']) {
  // جلب الدور من الهيدر أو البودي
  const role = req.headers['x-user-role'] || req.body.role || req.body.Role;
  if (!role || !allowedRoles.includes(role)) {
    return res.status(403).json({ error: 'ليس لديك الصلاحية لتنفيذ هذا الإجراء' });
  }
  next();
}


const { getSheetRows, addSheetRow, updateSheetRow, deleteSheetRow } = require('../googleSheets');
const SHEET_NAME = 'Users';
const ADMIN_ROLES = ['admin', 'مدير', 'مشرف', 'مدير النظام'];

// جلب جميع المستخدمين مع دعم الفروع
router.get('/', async (req, res) => {
  try {
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const users = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] !== undefined ? row[i] : '';
      });
      obj.password = undefined;
      if ('active' in obj) {
        obj.active = String(obj.active).toLowerCase() === 'true';
      }
      if (!('id' in obj)) obj.id = '';
      if (!('username' in obj)) obj.username = '';
      if (!('role' in obj)) obj.role = '';
      if (!('branch' in obj)) obj.branch = '1';
      return obj;
    });
    // فلترة حسب الفرع إذا لم يكن المستخدم مشرف إدارة
    const userRole = req.headers['x-user-role'] || '';
    const userBranch = req.headers['x-user-branch'] || '';
    if (!ADMIN_ROLES.includes(userRole) && userBranch) {
      return res.json(users.filter(u => u.branch === userBranch));
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إضافة مستخدم جديد مع دعم الفرع
router.post('/', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { username, password, role, branch } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: 'البيانات ناقصة' });
    // تحقق من عدم تكرار اسم المستخدم
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const usernameIndex = headers.indexOf('username');
    if (rows.some((row, idx) => idx > 0 && row[usernameIndex] === username)) {
      return res.status(409).json({ error: 'اسم المستخدم موجود مسبقاً' });
    }
    const id = rows.length;
    // إذا لم يُرسل branch اجعله افتراضيًا 1
    const userBranch = branch || req.headers['x-user-branch'] || '1';
    // دعم الأعمدة: [id, username, password, role, active, branch]
    let row = [id, username, password, role, 'true', userBranch];
    // إذا كان الجدول فيه أعمدة إضافية، أكملها بقيم فارغة
    while (row.length < headers.length) row.push('');
    await addSheetRow(SHEET_NAME, row);
    res.json({ success: true, user: { id, username, role, active: true, branch: userBranch } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف مستخدم فعلياً من Google Sheets
router.delete('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('id');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'المستخدم غير موجود' });
    await deleteSheetRow(SHEET_NAME, rowIndex + 1); // +1 لأن الصفوف تبدأ من 1 في الشيت
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تعديل بيانات مستخدم مع دعم الفرع
router.put('/:id', (req, res, next) => checkRole(req, res, next), async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const idIndex = headers.indexOf('id');
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[idIndex] == id);
    if (rowIndex === -1) return res.status(404).json({ error: 'المستخدم غير موجود' });
    // إذا لم يُرسل branch استخدم القديم
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

// تغيير كلمة مرور الأدمن (فعلي)
router.post('/change-password', async (req, res) => {
  try {
    const { username, oldPass, newPass } = req.body;
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const usernameIndex = headers.indexOf('username');
    const passwordIndex = headers.indexOf('password');
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][usernameIndex] === username) {
        if (rows[i][passwordIndex] !== oldPass) {
          return res.status(403).json({ error: 'كلمة المرور القديمة غير صحيحة' });
        }
        rowIndex = i;
        break;
      }
    }
    if (rowIndex === -1) return res.status(404).json({ error: 'المستخدم غير موجود' });
    const updatedRow = [...rows[rowIndex]];
    updatedRow[passwordIndex] = newPass;
    await updateSheetRow(SHEET_NAME, rowIndex + 1, updatedRow);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تسجيل الدخول (Login)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'البيانات ناقصة' });
    const rows = await getSheetRows(SHEET_NAME);
    const headers = rows[0];
    const usernameIndex = headers.indexOf('username');
    const passwordIndex = headers.indexOf('password');
    const activeIndex = headers.indexOf('active');
    let foundUser;
    for (let i = 1; i < rows.length; i++) {
      if (
        rows[i][usernameIndex] === username &&
        rows[i][passwordIndex] === password &&
        (String(rows[i][activeIndex]).toLowerCase() === 'true' || rows[i][activeIndex] === true)
      ) {
        foundUser = {};
        headers.forEach((h, idx) => {
          if (h !== 'password') foundUser[h] = rows[i][idx];
        });
        break;
      }
    }
    if (!foundUser)
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة أو الحساب غير نشط' });
    res.json(foundUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

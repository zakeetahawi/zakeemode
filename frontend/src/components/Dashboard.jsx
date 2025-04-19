import React, { useState } from 'react';

const dummyUsers = [
  { id: 1, username: 'admin', role: 'مدير', active: true },
  { id: 2, username: 'user1', role: 'موظف', active: true },
];

export default function Dashboard({ user }) {
  const [users, setUsers] = useState(dummyUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'موظف' });
  const [showChangePass, setShowChangePass] = useState(false);
  const [adminPass, setAdminPass] = useState({ oldPass: '', newPass: '', confirm: '' });
  const [stats] = useState({
    clients: 120,
    orders: 80,
    installations: 30,
    inventory: 55,
  });
  const [settings, setSettings] = useState({ companyName: 'مؤسستي', logo: '', language: 'ar' });

  // Dummy handlers (replace with API calls)
  const handleAddUser = e => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: users.length + 1, active: true }]);
    setShowAddUser(false);
    setNewUser({ username: '', password: '', role: 'موظف' });
  };
  const handleDeleteUser = id => setUsers(users.filter(u => u.id !== id));
  const handleChangePass = e => {
    e.preventDefault();
    alert('تم تغيير كلمة المرور (تجريبي)');
    setShowChangePass(false);
    setAdminPass({ oldPass: '', newPass: '', confirm: '' });
  };
  const handleSettings = e => {
    e.preventDefault();
    alert('تم حفظ الإعدادات (تجريبي)');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-blue-100 my-8">
      <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">لوحة التحكم الإدارية</h2>
      {/* إحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{stats.clients}</div>
          <div className="text-blue-900">العملاء</div>
        </div>
        <div className="bg-blue-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{stats.orders}</div>
          <div className="text-blue-900">الطلبات</div>
        </div>
        <div className="bg-blue-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{stats.installations}</div>
          <div className="text-blue-900">التركيبات</div>
        </div>
        <div className="bg-blue-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{stats.inventory}</div>
          <div className="text-blue-900">المخزون</div>
        </div>
      </div>
      {/* إدارة المستخدمين */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-blue-800">إدارة المستخدمين</h3>
          <button className="bg-blue-600 text-white rounded px-3 py-1 font-bold hover:bg-blue-700" onClick={() => setShowAddUser(v => !v)}>
            + مستخدم جديد
          </button>
        </div>
        {showAddUser && (
          <form className="bg-blue-50 rounded-xl p-4 mb-4 flex gap-2 flex-wrap" onSubmit={handleAddUser}>
            <input className="border rounded p-2 flex-1" placeholder="اسم المستخدم" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
            <input className="border rounded p-2 flex-1" placeholder="كلمة المرور" required type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <select className="border rounded p-2" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="موظف">موظف</option>
              <option value="مدير">مدير</option>
            </select>
            <button className="bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700" type="submit">حفظ</button>
          </form>
        )}
        <table className="w-full border text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">#</th>
              <th className="p-2 border">اسم المستخدم</th>
              <th className="p-2 border">الدور</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.username}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border">{u.active ? 'نشط' : 'غير نشط'}</td>
                <td className="p-2 border">
                  <button className="text-red-600 font-bold" onClick={() => handleDeleteUser(u.id)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* تغيير كلمة مرور الأدمن */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-blue-800 mb-2">تغيير كلمة مرور الأدمن</h3>
        {!showChangePass && <button className="bg-blue-600 text-white rounded px-4 py-1 font-bold hover:bg-blue-700" onClick={() => setShowChangePass(true)}>تغيير كلمة المرور</button>}
        {showChangePass && (
          <form className="bg-blue-50 rounded-xl p-4 flex flex-col gap-2 mt-2" onSubmit={handleChangePass}>
            <input className="border rounded p-2" type="password" placeholder="كلمة المرور القديمة" required value={adminPass.oldPass} onChange={e => setAdminPass({ ...adminPass, oldPass: e.target.value })} />
            <input className="border rounded p-2" type="password" placeholder="كلمة المرور الجديدة" required value={adminPass.newPass} onChange={e => setAdminPass({ ...adminPass, newPass: e.target.value })} />
            <input className="border rounded p-2" type="password" placeholder="تأكيد كلمة المرور" required value={adminPass.confirm} onChange={e => setAdminPass({ ...adminPass, confirm: e.target.value })} />
            <button className="bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700 mt-2" type="submit">حفظ</button>
          </form>
        )}
      </div>
      {/* إعدادات عامة */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-blue-800 mb-2">الإعدادات العامة</h3>
        <form className="bg-blue-50 rounded-xl p-4 flex flex-col gap-2" onSubmit={handleSettings}>
          <input className="border rounded p-2" placeholder="اسم الشركة" value={settings.companyName} onChange={e => setSettings({ ...settings, companyName: e.target.value })} />
          <input className="border rounded p-2" placeholder="رابط الشعار (Logo)" value={settings.logo} onChange={e => setSettings({ ...settings, logo: e.target.value })} />
          <select className="border rounded p-2" value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
          <button className="bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700 mt-2" type="submit">حفظ الإعدادات</button>
        </form>
      </div>
      {/* سجل العمليات */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-blue-800 mb-2">سجل العمليات</h3>
        <ul className="bg-blue-50 rounded-xl p-4 max-h-40 overflow-y-auto text-sm">
          <li>دخول الأدمن - 2025-04-19 18:00</li>
          <li>إضافة عميل جديد - 2025-04-19 17:55</li>
          <li>تعديل طلب - 2025-04-19 17:40</li>
          <li>تغيير إعدادات النظام - 2025-04-19 17:30</li>
        </ul>
      </div>
    </div>
  );
}

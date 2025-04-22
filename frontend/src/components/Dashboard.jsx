import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);


import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const userRole = user.role || user.Role || 'موظف';
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

  // بيانات تجريبية للعملاء حسب النوع
  const clientsByType = {
    labels: ['أفراد', 'شركات', 'حكومي'],
    datasets: [{
      label: 'عدد العملاء',
      data: [60, 40, 20],
      backgroundColor: ['#60a5fa', '#fbbf24', '#34d399'],
      borderRadius: 8,
    }],
  };

  // بيانات تجريبية للطلبات حسب الحالة
  const ordersByStatus = {
    labels: ['جديد', 'قيد التنفيذ', 'مكتمل', 'ملغي'],
    datasets: [{
      label: 'الطلبات',
      data: [30, 25, 20, 5],
      backgroundColor: ['#6366f1', '#f59e42', '#10b981', '#ef4444'],
      borderWidth: 1,
    }],
  };

  // بيانات ملخص المخزون
  const inventorySummary = {
    labels: ['أجهزة', 'اكسسوارات', 'مواد استهلاكية'],
    datasets: [{
      label: 'المخزون',
      data: [25, 20, 10],
      backgroundColor: ['#a78bfa', '#f87171', '#fbbf24'],
      borderWidth: 1,
    }],
  };

  const [settings, setSettings] = useState({ companyName: 'مؤسستي', logo: '', language: 'ar' });

  // API handlers
  React.useEffect(() => {
    fetchUsers();
  }, []);

  // حفظ المستخدم الحالي في localStorage عند تغييره
  React.useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:4000/api/users');
    const data = await res.json();
    setUsers(data);
    console.log('users from API:', data);
  }

  const handleAddUser = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      fetchUsers();
      setShowAddUser(false);
      setNewUser({ username: '', password: '', role: 'موظف' });
    } else {
      const err = await res.json();
      alert(err.error || 'حدث خطأ أثناء الإضافة');
    }
  };

  const handleDeleteUser = async id => {
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم نهائيًا؟')) return;
    const res = await fetch(`http://localhost:4000/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== id && u.UserID !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleChangePass = async e => {
    e.preventDefault();
    if (adminPass.newPass !== adminPass.confirm) {
      alert('تأكيد كلمة المرور غير متطابق');
      return;
    }
    const res = await fetch('http://localhost:4000/api/users/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPass: adminPass.oldPass, newPass: adminPass.newPass }),
    });
    if (res.ok) {
      alert('تم تغيير كلمة المرور بنجاح');
      setShowChangePass(false);
      setAdminPass({ oldPass: '', newPass: '', confirm: '' });
    } else {
      const err = await res.json();
      alert(err.error || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  const handleSettings = e => {
    e.preventDefault();
    alert('تم حفظ الإعدادات (تجريبي)');
  };

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-tr from-blue-50 via-white to-blue-100 rounded-3xl shadow-2xl p-10 border border-blue-200 my-12 animate-fade-in">
      <h2 className="text-4xl font-extrabold text-blue-900 mb-10 text-center tracking-tight drop-shadow-lg">لوحة التحكم الإدارية</h2>
      {/* الرسوم البيانية الدائرية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center animate-tile">
          <h4 className="font-bold mb-2 text-blue-700">العملاء حسب النوع</h4>
          <div className="w-full h-48 flex items-center justify-center">
            <Pie data={clientsByType} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 14 } } } }, responsive: true }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center animate-tile">
          <h4 className="font-bold mb-2 text-green-700">الطلبات حسب الحالة</h4>
          <div className="w-full h-48 flex items-center justify-center">
            <Pie data={ordersByStatus} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 14 } } } }, responsive: true }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center animate-tile">
          <h4 className="font-bold mb-2 text-purple-700">ملخص المخزون</h4>
          <div className="w-full h-48 flex items-center justify-center">
            <Pie data={inventorySummary} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 14 } } } }, responsive: true }} />
          </div>
          <div className="mt-2 text-gray-700 text-sm">عدد الأصناف: 3 | إجمالي الكمية: 55</div>
        </div>
      </div>
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-center shadow-lg hover:scale-105 transition-transform cursor-pointer animate-tile" onClick={() => navigate('/clients')}>
          <div className="text-4xl mb-2"><i className="fas fa-users"></i></div>
          <div className="text-3xl font-extrabold text-white">{stats.clients}</div>
          <div className="text-blue-100 text-lg mt-2">العملاء</div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-center shadow-lg hover:scale-105 transition-transform cursor-pointer animate-tile" onClick={() => navigate('/orders')}>
          <div className="text-4xl mb-2"><i className="fas fa-shopping-cart"></i></div>
          <div className="text-3xl font-extrabold text-white">{stats.orders}</div>
          <div className="text-green-100 text-lg mt-2">الطلبات</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 text-center shadow-lg hover:scale-105 transition-transform cursor-pointer animate-tile" onClick={() => navigate('/installations')}>
          <div className="text-4xl mb-2"><i className="fas fa-ruler-combined"></i></div>
          <div className="text-3xl font-extrabold text-white">{stats.installations}</div>
          <div className="text-yellow-100 text-lg mt-2">التركيبات</div>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-center shadow-lg hover:scale-105 transition-transform cursor-pointer animate-tile" onClick={() => navigate('/inventory')}>
          <div className="text-4xl mb-2"><i className="fas fa-boxes"></i></div>
          <div className="text-3xl font-extrabold text-white">{stats.inventory}</div>
          <div className="text-purple-100 text-lg mt-2">المخزون</div>
        </div>
      </div>
      {/* إدارة المستخدمين */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-blue-800">إدارة المستخدمين</h3>
          {userRole === 'مدير' || userRole === 'مشرف' || userRole === 'admin' || userRole === 'مدير النظام' ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold shadow hover:bg-blue-700 transition mb-4"
              onClick={() => setShowAddUser(true)}
            >إضافة مستخدم جديد</button>
          ) : null}
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
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-gray-500">لا يوجد مستخدمون لعرضهم</td></tr>
            )}
            {users.map((u, idx) => {
              // حماية من القيم غير المعرفة
              const id = u.id || u.UserID || idx + 1;
              const username = u.username || u.Username || '';
              const role = u.role || u.Role || '';
              let active = '';
              if (u.active !== undefined) active = u.active ? 'نشط' : 'غير نشط';
              else if (u.IsActive !== undefined) active = u.IsActive === 'نشط' ? 'نشط' : 'غير نشط';
              else active = '';
              return (
                <tr key={id}>
                  <td className="p-2 border">{id}</td>
                  <td className="p-2 border">{username}</td>
                  <td className="p-2 border">{role}</td>
                  <td className="p-2 border">{active}</td>
                  <td className="p-2 border">
                    <button className="text-red-600 font-bold" onClick={() => handleDeleteUser(id)}>حذف</button>
                  </td>
                </tr>
              );
            })}
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
